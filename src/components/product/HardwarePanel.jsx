import { useState, useMemo } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import { HARDWARE_STATUSES, HARDWARE_STATUS_COLORS } from "../../lib/constants";
import DebouncedField from "../DebouncedField";
import { exportToExcel } from "../../lib/excel";
import { useConfirm } from "../ConfirmDialog";

export default function HardwarePanel({ items, features, clients, onAdd, onUpdate, onDelete }) {
  const [clientFilter, setClientFilter] = useState("all"); // "all" | "unassigned" | a client id
  const confirmDialog = useConfirm();

  function featureTitle(id) {
    return features.find((f) => f.id === id)?.title || "";
  }
  function clientName(id) {
    return clients.find((c) => c.id === id)?.name || "";
  }

  const filtered = useMemo(() => {
    if (clientFilter === "all") return items;
    if (clientFilter === "unassigned") return items.filter((h) => !h.client_id);
    return items.filter((h) => h.client_id === clientFilter);
  }, [items, clientFilter]);

  function handleExport() {
    exportToExcel(
      "producTEL-hardware-bom",
      "Hardware BOM",
      filtered.map((h) => ({
        "Component name": h.name,
        Model: h.model,
        Stock: h.stock_count,
        "Lead time": h.lead_time,
        Status: h.status,
        Price: h.price,
        "Supplier / vendor note": h.vendor_note,
        "Client / Project": clientName(h.client_id) || "Unassigned",
        "Linked feature": featureTitle(h.linked_feature_id),
      }))
    );
  }

  return (
    <div className="main-inner">
      <div className="page-header">
        <div>
          <div className="page-title">Hardware / BOM Tracker</div>
          <div className="page-sub">Cameras, processors, enclosures — everything that goes into a physical prototype.</div>
        </div>
        <div className="page-actions">
          <select className="input" style={{ width: 180 }} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
            <option value="all">All clients</option>
            <option value="unassigned">Unassigned</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name || "Untitled client"}</option>)}
          </select>
          <button className="btn btn-sm" onClick={handleExport}><Download size={13} /> Download Excel</button>
          <button className="btn btn-primary btn-sm" onClick={onAdd}><Plus size={13} /> Add component</button>
        </div>
      </div>

      {filtered.length === 0 && <div className="no-items">{items.length === 0 ? "No hardware logged yet." : "No components for this filter."}</div>}

      {filtered.length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Component name</th>
                <th>Model</th>
                <th>Stock</th>
                <th>Lead time</th>
                <th>Status</th>
                <th>Price</th>
                <th>Supplier / vendor note</th>
                <th>Client / Project</th>
                <th>Linked feature</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} style={{ cursor: "default" }} onClick={(e) => e.stopPropagation()}>
                  <td style={{ minWidth: 160 }}>
                    <DebouncedField value={h.name} placeholder="e.g. Industrial camera" onCommit={(v) => onUpdate(h.id, { name: v })} />
                  </td>
                  <td style={{ minWidth: 130 }}>
                    <DebouncedField value={h.model} placeholder="Model / SKU" onCommit={(v) => onUpdate(h.id, { model: v })} />
                  </td>
                  <td>
                    <DebouncedField
                      value={h.stock_count}
                      type="number"
                      style={{ width: 70 }}
                      onCommit={(v) => onUpdate(h.id, { stock_count: Number(v) || 0 })}
                    />
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <DebouncedField value={h.lead_time} placeholder="e.g. 2 weeks" onCommit={(v) => onUpdate(h.id, { lead_time: v })} />
                  </td>
                  <td>
                    <select
                      className="input status-pill-select"
                      style={{ background: HARDWARE_STATUS_COLORS[h.status] || "var(--panel-3)" }}
                      value={h.status || "In Stock"}
                      onChange={(e) => onUpdate(h.id, { status: e.target.value })}
                    >
                      {HARDWARE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <DebouncedField
                      value={h.price}
                      type="number"
                      style={{ width: 90 }}
                      onCommit={(v) => onUpdate(h.id, { price: Number(v) || 0 })}
                    />
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <DebouncedField value={h.vendor_note} placeholder="e.g. IndiaMART — Acme Traders" onCommit={(v) => onUpdate(h.id, { vendor_note: v })} />
                  </td>
                  <td style={{ minWidth: 150 }}>
                    <select className="input" value={h.client_id || ""} onChange={(e) => onUpdate(h.id, { client_id: e.target.value || null })}>
                      <option value="">— Unassigned —</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name || "Untitled client"}</option>)}
                    </select>
                  </td>
                  <td style={{ minWidth: 150 }}>
                    <select className="input" value={h.linked_feature_id || ""} onChange={(e) => onUpdate(h.id, { linked_feature_id: e.target.value || null })}>
                      <option value="">— none —</option>
                      {features.map((f) => <option key={f.id} value={f.id}>{f.title || "Untitled"}</option>)}
                    </select>
                  </td>
                  <td>
                    <button
                      className="icon-btn danger"
                      onClick={() => confirmDialog(`Delete "${h.name || "this component"}"?`).then((ok) => ok && onDelete(h.id))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
