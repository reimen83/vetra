import { expandQueries, matchCategories, normalize } from "./categories.js";
import { opportunityRank, scorePlace } from "./score.js";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const OVERPASS = "https://overpass-api.de/api/interpreter";
const UA = "VetraLeadSearch/1.0 (local prospector; contact: vetra@local)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": UA,
          Accept: "application/json",
          ...(options.headers || {})
        }
      });
      if (res.status === 429 || res.status >= 500) {
        await sleep(700 * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await sleep(500 * (i + 1));
    }
  }
  throw new Error("Falha na busca externa");
}

function uniqueKey(item) {
  const osm = item.osm_type && item.osm_id ? `${item.osm_type}:${item.osm_id}` : "";
  const name = normalize(item.name);
  const city = normalize(item.city || item.address || "");
  return osm || `${name}|${city}`;
}

function parseAddress(addr = {}) {
  const parts = [
    addr.road && addr.house_number ? `${addr.road}, ${addr.house_number}` : addr.road,
    addr.suburb || addr.neighbourhood,
    addr.city || addr.town || addr.village || addr.municipality,
    addr.state,
    addr.postcode
  ].filter(Boolean);
  return parts.join(" · ");
}

function extractCity(addr = {}) {
  return addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
}

function guessCategory(item) {
  const tags = item.extratags || {};
  const cls = item.class;
  const type = item.type;
  if (tags.amenity) return titleize(tags.amenity);
  if (tags.shop) return titleize(tags.shop);
  if (tags.office) return titleize(tags.office);
  if (tags.craft) return titleize(tags.craft);
  if (tags.tourism) return titleize(tags.tourism);
  if (cls && type) return titleize(type.replace(/_/g, " "));
  return "";
}

function titleize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractWebsite(item) {
  const tags = item.extratags || {};
  return tags.website || tags["contact:website"] || tags.url || item.website || null;
}

function extractPhone(item) {
  const tags = item.extratags || {};
  return tags.phone || tags["contact:phone"] || tags["contact:mobile"] || tags.mobile || item.phone || null;
}

function extractInstagram(item) {
  const tags = item.extratags || {};
  const raw = tags.instagram || tags["contact:instagram"] || tags["contact:facebook"] || "";
  if (!raw) return null;
  if (/instagram\.com/i.test(raw) || raw.startsWith("@")) return raw.startsWith("http") ? raw : `https://instagram.com/${raw.replace(/^@/, "")}`;
  if (/^https?:/i.test(raw)) return raw;
  return `https://instagram.com/${String(raw).replace(/^@/, "")}`;
}

function toPlace(item, depth = "nominatim") {
  const addr = item.address || {};
  const name = item.name || item.display_name?.split(",")[0] || "Empresa sem nome";
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  const osmType = item.osm_type || item.type;
  const osmId = item.osm_id || item.id;
  const place = {
    place_id: item.place_id ? String(item.place_id) : `${osmType || "osm"}:${osmId}`,
    osm_type: osmType || null,
    osm_id: osmId ? String(osmId) : null,
    name,
    address: parseAddress(addr) || item.display_name || null,
    city: extractCity(addr),
    phone: extractPhone(item),
    website: extractWebsite(item),
    instagram: extractInstagram(item),
    category: guessCategory(item),
    rating: item.rating ?? null,
    user_ratings_total: item.user_ratings_total ?? null,
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lon) ? lon : null,
    osm_url: osmType && osmId ? `https://www.openstreetmap.org/${osmType}/${osmId}` : null,
    google_maps_url: Number.isFinite(lat) && Number.isFinite(lon)
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${lat},${lon}`)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
    match_depth: depth,
    source: "openstreetmap"
  };
  const scored = scorePlace(place);
  return { ...place, opportunity: scored };
}

async function nominatimSearch(query, limit = 18) {
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("accept-language", "pt-BR");
  const data = await fetchJson(url.toString());
  return Array.isArray(data) ? data : [];
}

async function geocodeCity(location) {
  if (!location) return null;
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", location);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  const data = await fetchJson(url.toString());
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit) return null;
  const bb = hit.boundingbox?.map(Number);
  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    bbox: bb && bb.length === 4 ? bb : null,
    display: hit.display_name
  };
}

function overpassAroundQuery(lat, lon, tags, radius = 8000) {
  const filters = tags.length
    ? tags.map((t) => {
        const [k, v] = t.split("=");
        return `nwr["${k}"="${v}"](around:${radius},${lat},${lon});`;
      }).join("\n")
    : `nwr["name"](around:${radius},${lat},${lon});`;
  return `[out:json][timeout:25];(${filters});out center tags 40;`;
}

async function overpassSearch(geo, query) {
  if (!geo) return [];
  const cats = matchCategories(query);
  const tags = [...new Set(cats.flatMap((c) => c.tags))].slice(0, 6);
  const body = overpassAroundQuery(geo.lat, geo.lon, tags);
  try {
    const data = await fetchJson(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(body)}`
    }, 1);
    const elements = Array.isArray(data?.elements) ? data.elements : [];
    return elements
      .filter((el) => el.tags?.name)
      .map((el) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        return {
          place_id: `overpass:${el.type}:${el.id}`,
          osm_type: el.type,
          osm_id: el.id,
          lat,
          lon,
          name: el.tags.name,
          display_name: [el.tags.name, el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(", "),
          address: {
            road: el.tags["addr:street"],
            house_number: el.tags["addr:housenumber"],
            suburb: el.tags["addr:suburb"],
            city: el.tags["addr:city"],
            state: el.tags["addr:state"],
            postcode: el.tags["addr:postcode"]
          },
          extratags: el.tags,
          class: Object.keys(el.tags).find((k) => ["amenity", "shop", "office", "craft", "tourism", "leisure"].includes(k)),
          type: el.tags.amenity || el.tags.shop || el.tags.office || el.tags.craft || el.tags.tourism
        };
      });
  } catch {
    return [];
  }
}

function relevance(place, query, location) {
  const q = normalize(query);
  const loc = normalize(location);
  const blob = normalize(`${place.name} ${place.category} ${place.address} ${place.city}`);
  let pts = 0;
  q.split(" ").filter(Boolean).forEach((tok) => {
    if (blob.includes(tok)) pts += 8;
  });
  if (loc && blob.includes(loc.split(" ")[0])) pts += 10;
  if (!place.website) pts += 6;
  if (place.phone) pts += 4;
  if (place.instagram) pts += 2;
  return pts;
}

export async function deepSearch({ query, location, onlyNoWebsite = false, minScore = 0, hasPhoneOnly = false, limit = 40 }) {
  const q = String(query || "").trim();
  const loc = String(location || "").trim();
  if (q.length < 2) throw new Error("Digite ao menos 2 caracteres");

  const queries = expandQueries(q, loc);
  const seen = new Map();
  const errors = [];

  const geo = loc ? await geocodeCity(loc).catch(() => null) : null;

  for (const term of queries.slice(0, 3)) {
    try {
      const hits = await nominatimSearch(term, 20);
      hits.forEach((h) => {
        const place = toPlace(h, "nominatim");
        const key = uniqueKey(place);
        if (!seen.has(key)) seen.set(key, place);
      });
      await sleep(250);
    } catch (err) {
      errors.push(String(err.message || err));
    }
  }

  try {
    const extra = await overpassSearch(geo, q);
    extra.forEach((h) => {
      const place = toPlace(h, "overpass");
      const key = uniqueKey(place);
      if (!seen.has(key)) seen.set(key, place);
    });
  } catch (err) {
    errors.push(String(err.message || err));
  }

  let results = [...seen.values()]
    .map((p) => ({ ...p, relevance: relevance(p, q, loc), rank: opportunityRank(p) }))
    .filter((p) => {
      if (onlyNoWebsite && p.website) return false;
      if (hasPhoneOnly && !p.phone) return false;
      if (minScore && p.opportunity.score < minScore) return false;
      if (loc) {
        const blob = normalize(`${p.address} ${p.city} ${p.name}`);
        const locToks = normalize(loc).split(" ").filter((t) => t.length > 2);
        if (locToks.length && !locToks.some((t) => blob.includes(t))) return false;
      }
      return true;
    })
    .sort((a, b) => (b.rank + b.relevance) - (a.rank + a.relevance))
    .slice(0, limit);

  return {
    results,
    meta: {
      query: q,
      location: loc || null,
      sources: ["nominatim", "overpass"],
      total: results.length,
      withoutWebsite: results.filter((r) => !r.website).length,
      withPhone: results.filter((r) => r.phone).length,
      geocoded: geo?.display || null,
      errors
    }
  };
}

export function whatsappUrl(phone, name) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length < 8) return null;
  const intl = d.length <= 11 ? `55${d}` : d;
  const text = encodeURIComponent(`Olá${name ? `, ${name}` : ""}! Vi o negócio de vocês e gostaria de conversar.`);
  return `https://wa.me/${intl}?text=${text}`;
}
