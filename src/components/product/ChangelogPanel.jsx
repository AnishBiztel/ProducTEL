import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { uid } from "../../lib/helpers";
import { useConfirm } from "../ConfirmDialog";

export default function ChangelogPanel({ items, releases, onAddRelease, onDeleteRelease, onAssignRelease }) {
  const [version, setVersion] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const confirmDialog = useConfirm();

  const shipped = items.filter((i) => i.status === "Shipped");
  const unassigned = shipped.filter((i) => !i.release_id);

  function submit() {
    if (!version.trim()) return;
    onAddRelease({ id: uid(), version: version.trim(), release_date: date, summary: summary.trim() });
    setVersion("");
    setSummary("");
  }

  return (
    <div className="main-inner">
      <div className="page-header">
        <div>
          <div className="page-title">Changelog</div>
        </div>
      </div>

      <div className="card settings-card">
        <div className="settings-section-title">New release</div>
        <div className="meta-row" style={{ marginTop: 0 }}>
          <div className="meta-field">
            <label>Version / label</label>
            <input className="input" style={{ width: 160 }} placeholder="v1.4" value={version} onChange={(e) => setVersion(e.target.value)} />
          </div>
          <div className="meta-field">
            <label>Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="field-label">Summary (optional)</div>
          <textarea className="input" placeholder="One or two lines about this release" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={submit}><Plus size={14} /> Add release</button>
      </div>

      {unassigned.length > 0 && (
        <div className="section">
          <div className="section-title">Shipped, not yet in a release</div>
          {unassigned.map((item) => (
            <div className="issue-row" key={item.id}>
              <span style={{ flex: 1 }}>{item.title || "Untitled"}</span>
              <select
                className="input"
                style={{ width: 160 }}
                value=""
                onChange={(e) => e.target.value && onAssignRelease(item.id, e.target.value)}
              >
                <option value="">Assign to release…</option>
                {releases.map((r) => (
                  <option key={r.id} value={r.id}>{r.version}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <div className="section-title">Releases</div>
        {releases.length === 0 && <div className="no-items">No releases logged yet.</div>}
        {releases.map((r) => {
          const shippedInRelease = shipped.filter((i) => i.release_id === r.id);
          return (
            <div className="card" style={{ padding: 16, marginBottom: 12 }} key={r.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{r.version}</span>
                  <span className="mono" style={{ color: "var(--muted-2)", marginLeft: 10, fontSize: 12 }}>{r.release_date}</span>
                </div>
                <button
                  className="icon-btn danger"
                  onClick={() => confirmDialog(`Delete release "${r.version}"?`).then((ok) => ok && onDeleteRelease(r.id))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {r.summary && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6 }}>{r.summary}</div>}
              {shippedInRelease.length > 0 && (
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
                  {shippedInRelease.map((i) => <li key={i.id} style={{ marginBottom: 3 }}>{i.title || "Untitled"}</li>)}
                </ul>
              )}
              {shippedInRelease.length === 0 && <div className="section-sub" style={{ marginTop: 8, marginBottom: 0 }}>No items attached yet.</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
