import { useEffect, useMemo, useState } from "react";
import { consumeMeetingDraft, loadMeetings, saveMeetings } from "../storage.js";

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const emptyForm = {
  date: todayISO(),
  time: "10:00",
  company: "",
  contact: "",
  phone: "",
  address: "",
  notes: "",
  status: "agendada"
};

export default function Agenda({ notify }) {
  const [meetings, setMeetings] = useState(() => loadMeetings());
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const draft = consumeMeetingDraft();
    if (draft?.company) setForm((prev) => ({ ...prev, ...draft }));
  }, []);

  const persist = (next) => {
    setMeetings(next);
    saveMeetings(next);
  };

  const dayItems = useMemo(
    () => meetings.filter((m) => m.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [meetings, date]
  );

  const counts = useMemo(() => ({
    agendada: meetings.filter((m) => m.status === "agendada").length,
    concluida: meetings.filter((m) => m.status === "concluida").length,
    cancelada: meetings.filter((m) => m.status === "cancelada").length
  }), [meetings]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.company.trim()) return notify("Informe a empresa");
    if (editing) {
      persist(meetings.map((m) => m.id === editing ? { ...m, ...form } : m));
      notify("Reunião atualizada");
    } else {
      persist([{ ...form, id: crypto.randomUUID() }, ...meetings]);
      notify("Reunião salva");
    }
    setEditing(null);
    setForm({ ...emptyForm, date });
  };

  const edit = (item) => {
    setEditing(item.id);
    setForm({ ...item });
  };

  const remove = (id) => {
    persist(meetings.filter((m) => m.id !== id));
    notify("Reunião excluída");
  };

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <section className="hero">
        <div className="kicker">Rotina comercial</div>
        <h1>Agenda de reuniões</h1>
        <p>Do lead ao compromisso, no mesmo fluxo.</p>
      </section>
      <div className="stats">
        <div className="card stat"><span className="muted">Agendadas</span><b>{counts.agendada}</b></div>
        <div className="card stat"><span className="muted">Concluídas</span><b>{counts.concluida}</b></div>
        <div className="card stat"><span className="muted">Canceladas</span><b>{counts.cancelada}</b></div>
        <div className="card stat"><span className="muted">No dia</span><b>{dayItems.length}</b></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1.1fr .9fr" }}>
        <form className="card grid" onSubmit={submit}>
          <h3 style={{ margin: 0 }}>{editing ? "Editar reunião" : "Nova reunião"}</h3>
          <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <label>Data<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
            <label>Horário<input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /></label>
          </div>
          <input placeholder="Empresa *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <input placeholder="Responsável" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Endereço / link da reunião" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="agendada">Agendada</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <textarea placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="row">
            {editing && <button type="button" className="btn secondary" onClick={() => { setEditing(null); setForm({ ...emptyForm, date }); }}>Cancelar</button>}
            <button className="btn">Salvar</button>
          </div>
        </form>
        <div className="card">
          <div className="row">
            <h3 style={{ margin: 0 }}>Reuniões do dia</h3>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 170 }} />
          </div>
          {!dayItems.length ? <p className="muted">Nenhuma reunião neste dia.</p> : dayItems.map((item) => (
            <div key={item.id} className="card" style={{ marginTop: 10, boxShadow: "none" }}>
              <div className="row">
                <div>
                  <strong>{item.time} · {item.company}</strong>
                  <div className="muted">{item.contact || "Sem responsável"} · {item.phone || "sem telefone"}</div>
                  <div className="badge" style={{ marginTop: 6 }}>{item.status}</div>
                </div>
                <div className="actions">
                  <button className="btn secondary" onClick={() => edit(item)}>Editar</button>
                  <button className="btn danger" onClick={() => remove(item.id)}>Excluir</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
