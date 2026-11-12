function digits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

export function hasPhone(phone) {
  return digits(phone).length >= 8;
}

export function scorePlace(place) {
  const factors = [];
  const phoneOk = hasPhone(place.phone);
  const rating = Number(place.rating || 0);
  const reviews = Number(place.user_ratings_total || 0);
  const noSite = !place.website;
  const hasIg = Boolean(place.instagram);
  const hasAddr = Boolean(place.address);
  const hasCat = Boolean(place.category);
  const hasMaps = Boolean(place.osm_url || place.google_maps_url);

  factors.push(phoneOk
    ? { kind: "ok", label: "Telefone público encontrado", points: 16 }
    : { kind: "warn", label: "Sem telefone público", points: 0 });

  factors.push(phoneOk
    ? { kind: "ok", label: "Canal WhatsApp viável", points: 12 }
    : { kind: "warn", label: "Sem WhatsApp identificável", points: 0 });

  factors.push(hasIg
    ? { kind: "ok", label: "Presença no Instagram", points: 8 }
    : { kind: "warn", label: "Pouca presença digital", points: 2 });

  if (rating >= 4.5 && reviews >= 20) {
    factors.push({ kind: "ok", label: `Reputação forte (${rating.toFixed(1)} · ${reviews})`, points: 18 });
  } else if (rating >= 4) {
    factors.push({ kind: "ok", label: `Boas avaliações (${rating.toFixed(1)})`, points: 12 });
  } else if (rating > 0) {
    factors.push({ kind: "warn", label: `Reputação a melhorar (${rating.toFixed(1)})`, points: 5 });
  } else {
    factors.push({ kind: "warn", label: "Sem avaliações públicas", points: 3 });
  }

  if (reviews >= 80) factors.push({ kind: "ok", label: "Alto volume de prova social", points: 8 });
  else if (reviews >= 10) factors.push({ kind: "ok", label: "Volume relevante de avaliações", points: 5 });
  else factors.push({ kind: "warn", label: "Pouca prova social", points: 1 });

  factors.push(hasAddr
    ? { kind: "ok", label: "Endereço localizável", points: 10 }
    : { kind: "warn", label: "Endereço incompleto", points: 0 });

  factors.push(hasCat
    ? { kind: "ok", label: `Segmento: ${place.category}`, points: 6 }
    : { kind: "warn", label: "Segmento não identificado", points: 0 });

  factors.push(hasMaps
    ? { kind: "ok", label: "Ficha ativa no mapa", points: 6 }
    : { kind: "warn", label: "Sem ficha de mapa", points: 0 });

  factors.push(noSite
    ? { kind: "ok", label: "Sem site — abertura imediata", points: 18 }
    : { kind: "warn", label: "Já possui site (pode estar fraco)", points: 6 });

  if (place.match_depth) {
    factors.push({ kind: "ok", label: `Busca profunda (fonte ${place.match_depth})`, points: 4 });
  }

  const raw = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.max(12, Math.min(100, Math.round(raw)));
  return { score, label: scoreLabel(score), factors };
}

export function scoreLabel(score) {
  if (score >= 85) return "Oportunidade excelente";
  if (score >= 70) return "Boa oportunidade";
  if (score >= 50) return "Oportunidade moderada";
  return "Oportunidade fria";
}

export function opportunityRank(place) {
  const s = scorePlace(place);
  let bonus = 0;
  if (!place.website) bonus += 12;
  if (hasPhone(place.phone)) bonus += 8;
  if (place.instagram) bonus += 3;
  return s.score + bonus;
}
