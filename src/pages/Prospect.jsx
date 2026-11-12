import { useMemo, useState } from "react";
import { api } from "../api.js";
import { loadLeads, saveLeads, setMeetingDraft, loadProjects, saveProjects, setStudioFocus } from "../storage.js";
import { defaultConfig } from "../siteBuilder.js";

const STATUS = [
  { id: "novo", label: "Novo" },
  { id: "contatado", label: "Contatado" },
  { id: "qualificado", label: "Qualificado" },
  { id: "convertido", label: "Convertido" },
  { id: "descartado", label: "Descartado" }
];

function Line({ label, value, href, className }) {
  if (!value) return null;
  const inner = <span className={`line ${className || ""}`}>{label} {value}</span>;
  return href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner;
}

function PlaceCard({ place, selected, onToggle, extra, compact }) {
  const score = place.opportunity?.score ?? 0;
  return (
    <article className={`card ${selected ? "selected" : ""}`} onClick={onToggle} style={{ cursor: onToggle ? "pointer" : "default" }}>
      <div className="row">
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="meta">
            {!compact && onToggle && <input type="checkbox" checked={!!selected} onChange={onToggle} onClick={(e) => e.stopPropagation()} />}
            <h3 style={{ margin: 0 }}>{place.name}</h3>
            {place.category && <span className="badge">{place.category}</span>}
            <span className="score">Score {score} · {place.opportunity?.label}</span>
          </div>
          <Line label="" value={place.address} />
          <Line label="" value={place.phone} href={place.phone ? `tel:${place.phone}` : undefined} />
          <Line label="" value={place.website} href={place.website || undefined} />
          {place.instagram
            ? <Line className="ig" label="" value={String(place.instagram).replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")} href={place.instagram} />
            : <span className="line">Sem Instagram público</span>}
        </div>
        {extra}
      </div>
    </article>
  );
}

export default function Prospect({ notify, go }) {
  const [tab, setTab] = useState("prospect");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(true);
  const [hasPhoneOnly, setHasPhoneOnly] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [leads, setLeads] = useState(() => loadLeads());
  const [leadQuery, setLeadQuery] = useState("");
  const [leadStatus, setLeadStatus] = useState("all");

  const persistLeads = (next) => {
    setLeads(next);
    saveLeads(next);
  };

  const search = async (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return notify("Digite ao menos 2 caracteres");
    setLoading(true);
    try {
      const data = await api.search({ query: query.trim(), location: location.trim(), onlyNoWebsite, hasPhoneOnly, minScore: Number(minScore) });
      setResults(data.results || []);
      setMeta(data.meta || null);
      setSelected(new Set((data.results || []).map((r) => r.place_id)));
      if (!data.results?.length) notify("Nenhum resultado com esses filtros");
      else notify(`${data.results.length} empresas ranqueadas`);
    } catch (err) {
      notify(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = () => {
    setSelected(selected.size === results.length ? new Set() : new Set(results.map((r) => r.place_id)));
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const saveSelected = () => {
    const picked = results.filter((r) => selected.has(r.place_id));
    if (!picked.length) return notify("Selecione ao menos uma empresa");
    const ids = new Set(leads.map((l) => l.place_id));
    const fresh = picked.filter((p) => !ids.has(p.place_id)).map((p) => ({
      ...p,
      id: crypto.randomUUID(),
      status: "novo",
      notes: "",
      created_at: new Date().toISOString()
    }));
    if (!fresh.length) return notify("Esses leads já estão salvos");
    persistLeads([...fresh, ...leads]);
    notify(`${fresh.length} lead${fresh.length > 1 ? "s" : ""} salvo${fresh.length > 1 ? "s" : ""}`);
  };

  const openWa = async (place) => {
    try {
      const { url } = await api.whatsapp(place.phone, place.name);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      notify(err.message);
    }
  };

  const schedule = (place) => {
    setMeetingDraft({
      company: place.name,
      contact: "",
      phone: place.phone || "",
      address: place.address || "",
      notes: ""
    });
    go("/agenda");
  };

  const createSite = (place) => {
    const projects = loadProjects();
    const exists = projects.find((p) => p.placeId === place.place_id);
    if (exists) {
      setStudioFocus(exists.id);
    } else {
      const now = new Date().toISOString();
      const item = {
        id: crypto.randomUUID(),
        placeId: place.place_id,
        source: "lead",
        status: "rascunho",
        place,
        config: defaultConfig(place),
        createdAt: now,
        updatedAt: now
      };
      saveProjects([item, ...projects]);
      setStudioFocus(item.id);
    }
    go("/studio");
    notify("Editor e preview abertos");
  };

  const exportCsv = () => {
    if (!leads.length) return notify("Nenhum lead para exportar");
    const header = ["Nome", "Categoria", "Telefone", "Endereço", "Site", "Instagram", "Score", "Status"];
    const rows = leads.map((g) => [g.name, g.category ?? "", g.phone ?? "", g.address ?? "", g.website ?? "", g.instagram ?? "", g.opportunity?.score ?? "", g.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([`\uFEFF${[header.join(","), ...rows].join("\n")}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads = useMemo(() => {
    const q = leadQuery.trim().toLowerCase();
    return leads.filter((l) => {
      if (leadStatus !== "all" && l.status !== leadStatus) return false;
      if (!q) return true;
      return `${l.name} ${l.category} ${l.address} ${l.phone}`.toLowerCase().includes(q);
    });
  }, [leads, leadQuery, leadStatus]);

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <section className="hero">
        <div className="kicker">Inteligência comercial</div>
        <h1>Prospectar com precisão, não com volume.</h1>
        <p>Busca profunda em mapas abertos, ranking de abertura e prioridade para quem ainda não tem site.</p>
      </section>

      <div className="tabs">
        <button className={`tab ${tab === "prospect" ? "on" : ""}`} onClick={() => setTab("prospect")}>Prospectar</button>
        <button className={`tab ${tab === "leads" ? "on" : ""}`} onClick={() => setTab("leads")}>Meus Leads ({leads.length})</button>
      </div>

      {tab === "prospect" && (
        <>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Busca aprofundada</h3>
            <form className="form-grid" onSubmit={search}>
              <input placeholder="O que? Ex: restaurantes, dentistas, barbearias" value={query} onChange={(e) => setQuery(e.target.value)} minLength={2} required />
              <input placeholder="Onde? Ex: Curitiba, Campinas, Recife" value={location} onChange={(e) => setLocation(e.target.value)} />
              <button className="btn" disabled={loading}>{loading ? "Buscando..." : "Buscar"}</button>
            </form>
            <div className="filters">
              <button type="button" className={`chip ${onlyNoWebsite ? "on" : ""}`} onClick={() => setOnlyNoWebsite((v) => !v)}>Sem site</button>
              <button type="button" className={`chip ${hasPhoneOnly ? "on" : ""}`} onClick={() => setHasPhoneOnly((v) => !v)}>Com telefone</button>
              <button type="button" className={`chip ${minScore === 70 ? "on" : ""}`} onClick={() => setMinScore(minScore === 70 ? 0 : 70)}>Score 70+</button>
              <button type="button" className={`chip ${minScore === 85 ? "on" : ""}`} onClick={() => setMinScore(minScore === 85 ? 0 : 85)}>Excelentes</button>
            </div>
          </div>

          {meta && (
            <div className="stats">
              <div className="card stat"><span className="muted">Resultados</span><b>{meta.total}</b></div>
              <div className="card stat"><span className="muted">Sem site</span><b>{meta.withoutWebsite}</b></div>
              <div className="card stat"><span className="muted">Com telefone</span><b>{meta.withPhone}</b></div>
              <div className="card stat"><span className="muted">Área</span><b style={{ fontSize: 14 }}>{meta.geocoded ? meta.geocoded.split(",")[0] : location || "—"}</b></div>
            </div>
          )}

          {results.length > 0 && (
            <div className="row" style={{ margin: "8px 0 12px" }}>
              <div className="meta">
                <button className="btn secondary" onClick={toggleAll}>{selected.size === results.length ? "Desmarcar todos" : "Selecionar todos"}</button>
                <span className="muted">{selected.size} de {results.length} selecionadas</span>
              </div>
              <button className="btn" onClick={saveSelected}>Salvar {selected.size} lead{selected.size === 1 ? "" : "s"}</button>
            </div>
          )}

          <div className="grid">
            {results.map((place) => (
              <PlaceCard
                key={place.place_id}
                place={place}
                selected={selected.has(place.place_id)}
                onToggle={() => toggleOne(place.place_id)}
                extra={
                  <div className="actions" onClick={(e) => e.stopPropagation()}>
                    {place.phone && <button className="btn secondary" onClick={() => openWa(place)}>WhatsApp</button>}
                    <button className="btn" onClick={() => createSite(place)}>Criar site</button>
                    <button className="btn secondary" onClick={() => schedule(place)}>Agendar</button>
                  </div>
                }
              />
            ))}
          </div>
        </>
      )}

      {tab === "leads" && (
        <>
          <div className="row" style={{ marginBottom: 12 }}>
            <input style={{ maxWidth: 320 }} placeholder="Filtrar leads" value={leadQuery} onChange={(e) => setLeadQuery(e.target.value)} />
            <select style={{ maxWidth: 200 }} value={leadStatus} onChange={(e) => setLeadStatus(e.target.value)}>
              <option value="all">Todos os status</option>
              {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <button className="btn secondary" onClick={exportCsv}>Exportar CSV</button>
          </div>
          {!filteredLeads.length ? (
            <div className="card empty">Nenhum lead salvo ainda. Faça uma busca na aba Prospectar.</div>
          ) : (
            <div className="grid">
              {filteredLeads.map((lead) => (
                <PlaceCard
                  key={lead.id}
                  place={lead}
                  extra={
                    <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                      <select className={`status-${lead.status}`} value={lead.status} onChange={(e) => persistLeads(leads.map((l) => l.id === lead.id ? { ...l, status: e.target.value } : l))}>
                        {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <div className="actions">
                        {lead.phone && <button className="icon-btn" title="WhatsApp" onClick={() => openWa(lead)}>WA</button>}
                        <button className="icon-btn" title="Criar site" onClick={() => createSite(lead)}>WEB</button>
                        <button className="icon-btn" title="Agendar" onClick={() => schedule(lead)}>CAL</button>
                        {lead.google_maps_url && <a className="icon-btn" style={{ display: "grid", placeItems: "center", textDecoration: "none" }} href={lead.google_maps_url} target="_blank" rel="noreferrer">MAP</a>}
                        <button className="icon-btn" title="Remover" onClick={() => { persistLeads(leads.filter((l) => l.id !== lead.id)); notify("Lead removido"); }}>X</button>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
