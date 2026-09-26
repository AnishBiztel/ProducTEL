import { useState } from "react";
import { ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { PRIORITIES, PRIORITY_COLORS, FEATURE_STATUSES, FEATURE_STATUS_COLORS } from "../../lib/constants";
import { handleEnterSave } from "../../lib/helpers";
import DebouncedField from "../DebouncedField";
import { useConfirm } from "../ConfirmDialog";

export default function FeatureCard({ item, onUpdate, onDelete, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const confirmDialog = useConfirm();

  return (
    <div className="spec-card">
      <div className="spec-card-head" onClick={() => setOpen(!open)}>
        <div className="spec-card-title">
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          <span className="priority-dot" style={{ background: PRIORITY_COLORS[item.priority] }} />
          <span>{item.title || "Untitled idea"}</span>
        </div>
        <div className="spec-card-head-right">
          <select
            className="input status-pill-select"
            style={{ background: FEATURE_STATUS_COLORS[item.status] }}
            value={item.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate(item.id, { status: e.target.value })}
          >
            {FEATURE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="icon-btn danger"
            onClick={(e) => {
              e.stopPropagation();
              confirmDialog(`Delete "${item.title || "this idea"}"? This can't be undone.`).then((ok) => ok && onDelete(item.id));
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div className="spec-body">
          <div>
            <div className="field-label">Title</div>
            <DebouncedField
              placeholder="Short, specific title"
              value={item.title}
              onCommit={(v) => onUpdate(item.id, { title: v })}
              onKeyDown={handleEnterSave}
            />
          </div>
          <div>
            <div className="field-label">Description</div>
            <DebouncedField
              as="textarea"
              placeholder="What is this, in a sentence or two?"
              value={item.description}
              onCommit={(v) => onUpdate(item.id, { description: v })}
              onKeyDown={handleEnterSave}
            />
          </div>
          <div className="spec-meta-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span className="field-label" style={{ marginBottom: 0 }}>Priority</span>
              <select className="input" style={{ width: 140 }} value={item.priority} onChange={(e) => onUpdate(item.id, { priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="field-label">Notes / PRD — what &amp; why</div>
            <DebouncedField
              as="textarea"
              style={{ minHeight: 120 }}
              placeholder={"What are we building, and why?\n- key requirement\n- key requirement\n- open question"}
              value={item.notes}
              onCommit={(v) => onUpdate(item.id, { notes: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
