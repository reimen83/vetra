import { useEffect, useMemo, useState } from "react";
import { consumeStudioFocus, loadLeads, loadProjects, saveProjects } from "../storage.js";
import { LAYOUTS, SEGMENTS, THEMES, applySegmentPreset, buildSiteHtml, defaultConfig, detectSegment } from "../siteBuilder.js";
import { compressMany, compressPhoto, isCustomPhoto } from "../photos.js";

const NICHES = ["Alimentação", "Beleza", "Saúde", "Oficina", "Imobiliária", "Comércio", "Serviços"];

function ensureConfig(item) {
  const base = defaultConfig(item?.place || {});
  const saved = item?.config || {};
  const merged = { ...base, ...saved };
  if (!saved.heroImage) merged.heroImage = base.heroImage;
  if (!saved.gallery?.length) merged.gallery = base.gallery;
  if (!saved.segmentId) {
    merged.segmentId = base.segmentId;
    merged.segmentLabel = base.segmentLabel;
    merged.mood = base.mood;
    merged.fonts = base.fonts;
  }
  if (!saved.services?.length) merged.services = base.services;
  return merged;
}

function withConfig(item) {
  return { ...item, config: ensureConfig(item) };
}

export default function Studio({ notify }) {
  const [projects, setProjects] = useState(() => loadProjects().map(withConfig));
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [manual, setManual] = useState({ name: "", category: "", city: "", phone: "" });
  const [activeId, setActiveId] = useState(null);
  const [tab, setTab] = useState("visual");
  const [device, setDevice] = useState("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const leads = loadLeads();

  useEffect(() => {
    const focusId = consumeStudioFocus();
    if (focusId && loadProjects().some((p) => p.id === focusId)) {
      setActiveId(focusId);
      setTab("visual");
    }
  }, []);

  const persist = (next) => {
    try {
      saveProjects(next);
      setProjects(next);
    } catch {
      notify("Armazenamento cheio. Remova fotos antigas ou use imagens menores.");
    }
  };

  const active = projects.find((p) => p.id === activeId) || null;
  const config = active ? ensureConfig(active) : null;

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!query) return true;
      return `${p.place?.name} ${p.place?.category}`.toLowerCase().includes(query);
    });
  }, [projects, q, filter]);

  const html = useMemo(() => {
    if (!active) return "";
    return buildSiteHtml(active.place, ensureConfig(active));
  }, [active]);

  const patch = (partial) => {
    if (!active) return;
    persist(projects.map((p) => {
      if (p.id !== active.id) return p;
      return {
        ...p,
        updatedAt: new Date().toISOString(),
        config: { ...ensureConfig(p), ...partial }
      };
    }));
  };

  const patchService = (index, field, value) => {
    const services = [...(config.services || [])];
    services[index] = { ...services[index], [field]: value };
    patch({ services });
  };

  const stockPreset = (place, segmentId) => {
    const preset = applySegmentPreset(place, segmentId);
    const current = active ? ensureConfig(active) : {};
    if (isCustomPhoto(current.heroImage)) preset.heroImage = current.heroImage;
    if ((current.gallery || []).some(isCustomPhoto)) {
      preset.gallery = current.gallery;
    }
    return preset;
  };

  const onHeroUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const heroImage = await compressPhoto(file, { maxWidth: 1800, quality: 0.8 });
      patch({ heroImage });
      notify("Foto de capa do cliente aplicada");
    } catch (err) {
      notify(err.message || "Falha ao enviar a foto");
    } finally {
      setUploading(false);
    }
  };

  const onGalleryUpload = async (event) => {
    const files = event.target.files;
    event.target.value = "";
    if (!files?.length) return;
    setUploading(true);
    try {
      const incoming = await compressMany(files, { maxWidth: 1400, quality: 0.76 });
      if (!incoming.length) throw new Error("Nenhuma imagem válida");
      const gallery = [...(config.gallery || []), ...incoming].slice(0, 8);
      patch({ gallery });
      notify(`${incoming.length} foto${incoming.length > 1 ? "s" : ""} do cliente adicionada${incoming.length > 1 ? "s" : ""}`);
    } catch (err) {
      notify(err.message || "Falha ao enviar as fotos");
    } finally {
      setUploading(false);
    }
  };

  const useAsHero = (src) => {
    patch({ heroImage: src });
    notify("Foto definida como capa");
  };

  const removeGalleryPhoto = (index) => {
    const gallery = (config.gallery || []).filter((_, i) => i !== index);
    patch({ gallery });
  };

  const restoreStockPhotos = () => {
    const preset = applySegmentPreset(active.place, config.segmentId);
    patch({ heroImage: preset.heroImage, gallery: preset.gallery });
    notify("Fotos genéricas restauradas");
  };

  const createProject = (place, source = "lead") => {
    const exists = projects.find((p) => p.placeId === place.place_id);
    if (exists) {
      setActiveId(exists.id);
      setTab("visual");
      return notify("Projeto já existia — preview aberto");
    }
    const now = new Date().toISOString();
    const item = withConfig({
      id: crypto.randomUUID(),
      placeId: place.place_id,
      source,
      status: "rascunho",
      place,
      createdAt: now,
      updatedAt: now
    });
    persist([item, ...projects]);
    setActiveId(item.id);
    setTab("visual");
    const seg = detectSegment(place);
    notify(`Identificado: ${seg.label} — tema e fotos aplicados`);
  };

  const fromLead = (lead) => createProject(lead, "lead");

  const fromManual = (e) => {
    e.preventDefault();
    if (!manual.name.trim()) return notify("Informe o nome da empresa");
    createProject({
      place_id: `studio-${crypto.randomUUID()}`,
      name: manual.name.trim(),
      category: manual.category || "Serviços",
      address: manual.city,
      phone: manual.phone,
      website: null,
      instagram: null
    }, "manual");
    setManual({ name: "", category: "", city: "", phone: "" });
  };

  const markReady = (id) => {
    persist(projects.map((p) => p.id === id ? { ...p, status: "pronto", updatedAt: new Date().toISOString() } : p));
    notify("Projeto marcado como pronto");
  };

  const duplicate = (item) => {
    const now = new Date().toISOString();
    const copy = withConfig({
      ...item,
      id: crypto.randomUUID(),
      placeId: `${item.placeId}-copy`,
      status: "rascunho",
      createdAt: now,
      updatedAt: now
    });
    persist([copy, ...projects]);
    setActiveId(copy.id);
    notify("Projeto duplicado");
  };

  const remove = (id) => {
    persist(projects.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(null);
    notify("Projeto excluído");
  };

  const download = (item) => {
    const blob = new Blob([buildSiteHtml(item.place, ensureConfig(item))], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(item.place.name || "site").toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openClientPreview = (item) => {
    const blob = new Blob([buildSiteHtml(item.place, ensureConfig(item))], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="container studio-page" style={{ paddingBottom: 48 }}>
      <section className="hero">
        <div className="kicker">Da oportunidade ao site</div>
        <h1>Estúdio de Sites</h1>
        <p>Temas, layouts e preview real — veja exatamente o que o cliente vai ver.</p>
      </section>

      {!active && (
        <>
          <div className="grid studio-top">
            <form className="card grid" onSubmit={fromManual}>
              <h3 style={{ margin: 0 }}>Comece um novo site</h3>
              <input placeholder="Nome da empresa" value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} required />
              <select value={manual.category} onChange={(e) => setManual({ ...manual, category: e.target.value })}>
                <option value="">Nicho</option>
                {NICHES.map((n) => <option key={n}>{n}</option>)}
              </select>
              <input placeholder="Cidade" value={manual.city} onChange={(e) => setManual({ ...manual, city: e.target.value })} />
              <input placeholder="Telefone ou WhatsApp" value={manual.phone} onChange={(e) => setManual({ ...manual, phone: e.target.value })} />
              <button className="btn">Criar e pré-visualizar</button>
            </form>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Próximas oportunidades</h3>
              {!leads.length && <p className="muted">Salve leads na prospecção ou use a criação manual.</p>}
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="row" style={{ marginBottom: 8 }}>
                  <div>
                    <strong>{lead.name}</strong>
                    <div className="muted">{lead.category || "Sem nicho"}</div>
                  </div>
                  <button className="btn secondary" onClick={() => fromLead(lead)}>Abrir no editor</button>
                </div>
              ))}
            </div>
          </div>

          <div className="row" style={{ margin: "16px 0 12px" }}>
            <input style={{ maxWidth: 280 }} placeholder="Filtrar projetos" value={q} onChange={(e) => setQ(e.target.value)} />
            <select style={{ maxWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="rascunho">Rascunho</option>
              <option value="pronto">Pronto</option>
            </select>
          </div>
          <div className="grid">
            {!visible.length && <div className="card empty">Nenhum projeto encontrado. Crie um site para abrir o preview.</div>}
            {visible.map((item) => (
              <article key={item.id} className="card">
                <div className="row">
                  <div>
                    <h3 style={{ margin: 0 }}>{item.place.name}</h3>
                    <div className="muted">{item.place.category || "Genérico"} · {item.status} · {ensureConfig(item).themeId} / {ensureConfig(item).layoutId}</div>
                  </div>
                  <div className="actions">
                    <button className="btn" onClick={() => { setActiveId(item.id); setTab("visual"); }}>Editar e ver</button>
                    <button className="btn secondary" onClick={() => openClientPreview(item)}>Ver como cliente</button>
                    <button className="btn secondary" onClick={() => markReady(item.id)}>Pronto</button>
                    <button className="btn secondary" onClick={() => duplicate(item)}>Duplicar</button>
                    <button className="btn secondary" onClick={() => download(item)}>HTML</button>
                    <button className="btn danger" onClick={() => remove(item.id)}>Excluir</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {active && config && (
        <div className="studio-editor">
          <div className="row studio-toolbar">
            <button className="btn secondary" onClick={() => setActiveId(null)}>Voltar à biblioteca</button>
            <div>
              <strong>{active.place.name}</strong>
              <div className="muted">{config.segmentLabel || active.place.category || "Negócio local"} · {config.mood}</div>
            </div>
            <div className="actions">
              <button className={`chip ${device === "desktop" ? "on" : ""}`} onClick={() => setDevice("desktop")}>Desktop</button>
              <button className={`chip ${device === "tablet" ? "on" : ""}`} onClick={() => setDevice("tablet")}>Tablet</button>
              <button className={`chip ${device === "mobile" ? "on" : ""}`} onClick={() => setDevice("mobile")}>Mobile</button>
              <button className="btn secondary" onClick={() => setFullscreen(true)}>Tela cheia</button>
              <button className="btn" onClick={() => openClientPreview(active)}>Abrir como o cliente vê</button>
              <button className="btn secondary" onClick={() => download(active)}>Baixar HTML</button>
              <button className="btn secondary" onClick={() => markReady(active.id)}>Marcar pronto</button>
            </div>
          </div>

          <div className="studio-grid">
            <aside className="card studio-panel">
              <div className="tabs" style={{ marginTop: 0 }}>
                <button className={`tab ${tab === "visual" ? "on" : ""}`} onClick={() => setTab("visual")}>Visual</button>
                <button className={`tab ${tab === "fotos" ? "on" : ""}`} onClick={() => setTab("fotos")}>Fotos do cliente</button>
                <button className={`tab ${tab === "conteudo" ? "on" : ""}`} onClick={() => setTab("conteudo")}>Conteúdo</button>
              </div>

              {tab === "visual" && (
                <>
                  <h3>Segmento detectado</h3>
                  <p className="muted">O nome do estabelecimento define tema, texto e fotos de fundo.</p>
                  <div className="layout-grid">
                    {[{ id: "servicos", label: "Serviços", mood: "Genérico sofisticado" }, ...SEGMENTS].map((seg) => (
                      <button
                        key={seg.id}
                        type="button"
                        className={`layout-card ${config.segmentId === seg.id ? "on" : ""}`}
                        onClick={() => patch(stockPreset(active.place, seg.id))}
                      >
                        <strong>{seg.label}</strong>
                        <span>{seg.mood}</span>
                      </button>
                    ))}
                  </div>
                  {config.heroImage && (
                    <div className="hero-thumb" style={{ backgroundImage: `url(${config.heroImage})` }}>
                      {isCustomPhoto(config.heroImage) ? "Capa real do cliente" : "Foto de fundo do segmento"}
                    </div>
                  )}
                  <h3>Temas</h3>
                  <p className="muted">Paleta e tipografia do site do cliente.</p>
                  <div className="theme-grid">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`theme-card ${config.themeId === theme.id ? "on" : ""}`}
                        onClick={() => patch({ themeId: theme.id })}
                      >
                        <span className="swatches">
                          <i style={{ background: theme.brand }} />
                          <i style={{ background: theme.accent }} />
                          <i style={{ background: theme.bg }} />
                        </span>
                        <strong>{theme.name}</strong>
                        <span>{theme.desc}</span>
                      </button>
                    ))}
                  </div>
                  <h3>Layouts</h3>
                  <p className="muted">Estrutura da primeira dobra e hierarquia.</p>
                  <div className="layout-grid">
                    {LAYOUTS.map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        className={`layout-card ${config.layoutId === layout.id ? "on" : ""}`}
                        onClick={() => patch({ layoutId: layout.id })}
                      >
                        <strong>{layout.name}</strong>
                        <span>{layout.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {tab === "fotos" && (
                <div className="grid photo-editor">
                  <h3 style={{ marginBottom: 0 }}>Fotos reais do negócio</h3>
                  <p className="muted">Substitua as imagens genéricas por fotos da fachada, equipe, ambiente e serviços do cliente.</p>

                  <div className="photo-block">
                    <div className="row" style={{ alignItems: "center" }}>
                      <strong>Foto de capa</strong>
                      <label className="btn secondary file-btn">
                        {uploading ? "Enviando..." : "Enviar capa"}
                        <input type="file" accept="image/*" hidden disabled={uploading} onChange={onHeroUpload} />
                      </label>
                    </div>
                    {config.heroImage && (
                      <div className="hero-thumb tall" style={{ backgroundImage: `url(${config.heroImage})` }}>
                        {isCustomPhoto(config.heroImage) ? "Foto do cliente" : "Imagem genérica do nicho"}
                      </div>
                    )}
                  </div>

                  <div className="photo-block">
                    <div className="row" style={{ alignItems: "center" }}>
                      <strong>Galeria</strong>
                      <label className="btn secondary file-btn">
                        Adicionar fotos
                        <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={onGalleryUpload} />
                      </label>
                    </div>
                    <p className="muted">Até 8 fotos. JPEG/PNG/WEBP. Elas entram no hero de serviços e na faixa Atmosfera.</p>
                    <div className="photo-grid">
                      {(config.gallery || []).map((src, index) => (
                        <figure key={index} className="photo-cell" style={{ backgroundImage: `url(${src})` }}>
                          <span className={`photo-tag ${isCustomPhoto(src) ? "real" : ""}`}>{isCustomPhoto(src) ? "Cliente" : "Banco"}</span>
                          <div className="photo-actions">
                            <button type="button" className="btn secondary" onClick={() => useAsHero(src)}>Usar como capa</button>
                            <button type="button" className="btn danger" onClick={() => removeGalleryPhoto(index)}>Remover</button>
                          </div>
                        </figure>
                      ))}
                    </div>
                    {!(config.gallery || []).length && <p className="muted">Nenhuma foto na galeria ainda.</p>}
                  </div>

                  <button type="button" className="btn secondary" onClick={restoreStockPhotos}>Restaurar fotos genéricas do segmento</button>
                </div>
              )}

              {tab === "conteudo" && (
                <div className="grid">
                  <label>Título principal
                    <input value={config.headline} onChange={(e) => patch({ headline: e.target.value })} />
                  </label>
                  <label>Subtítulo
                    <textarea value={config.subheadline} onChange={(e) => patch({ subheadline: e.target.value })} />
                  </label>
                  <label>Sobre
                    <textarea value={config.about} onChange={(e) => patch({ about: e.target.value })} />
                  </label>
                  <label>Texto do botão
                    <input value={config.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} />
                  </label>
                  <label>Título de contato
                    <input value={config.contactTitle} onChange={(e) => patch({ contactTitle: e.target.value })} />
                  </label>
                  {(config.services || []).map((service, i) => (
                    <div key={i} className="card" style={{ boxShadow: "none", padding: 12 }}>
                      <input value={service.title} onChange={(e) => patchService(i, "title", e.target.value)} />
                      <textarea value={service.text} onChange={(e) => patchService(i, "text", e.target.value)} />
                    </div>
                  ))}
                  <label>Rodapé
                    <input value={config.footerNote} onChange={(e) => patch({ footerNote: e.target.value })} />
                  </label>
                </div>
              )}
            </aside>

            <section className="preview-stage">
              <div className="preview-chrome">
                <span className="dots"><i /><i /><i /></span>
                <span className="preview-url">preview / {active.place.name}</span>
                <span className="muted">{device}</span>
              </div>
              <div className={`preview-frame ${device}`}>
                <iframe title="Preview do site do cliente" srcDoc={html} sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts" />
              </div>
            </section>
          </div>
        </div>
      )}

      {fullscreen && active && (
        <div className="preview-modal">
          <div className="preview-modal-bar">
            <strong>Visão do cliente — {active.place.name}</strong>
            <div className="actions">
              <button className={`chip ${device === "desktop" ? "on" : ""}`} onClick={() => setDevice("desktop")}>Desktop</button>
              <button className={`chip ${device === "mobile" ? "on" : ""}`} onClick={() => setDevice("mobile")}>Mobile</button>
              <button className="btn secondary" onClick={() => openClientPreview(active)}>Nova aba</button>
              <button className="btn" onClick={() => setFullscreen(false)}>Fechar</button>
            </div>
          </div>
          <div className={`preview-frame ${device} modal`}>
            <iframe title="Preview tela cheia" srcDoc={html} sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts" />
          </div>
        </div>
      )}
    </main>
  );
}
