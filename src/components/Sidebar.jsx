import { Search, Plus, Download, Upload } from "lucide-react";
import { STAGES, STAGE_COLORS, PRIORITY_COLORS, STUCK_STAGE_DAYS } from "../lib/constants";
import { timeAgo, isOverdue, daysSince } from "../lib/helpers";

export default function Sidebar({
  filtered,
  selectedId,
  onSelect,
  query,
  setQuery,
  stageFilter,
  setStageFilter,
  onAddClient,
  syncState,
  onExport,
  onImport,
  fileInputRef,
  totalClients,
  activeClients,
  openIssues,
  pendingSpecs,
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-head">
        <div className="sidebar-title">Clients</div>
        <div className={"sync-state" + (syncState === "error" ? " error" : "")}>
          {syncState === "saving" ? "syncing…" : syncState === "synced" ? "synced" : syncState === "error" ? "sync failed" : ""}
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat"><span className="stat-num">{totalClients}</span><span className="stat-label">clients</span></div>
        <div className="stat"><span className="stat-num" style={{ color: "var(--accent)" }}>{activeClients}</span><span className="stat-label">active</span></div>
        <div className="stat"><span className="stat-num" style={{ color: openIssues > 0 ? "var(--red)" : "var(--muted)" }}>{openIssues}</span><span className="stat-label">issues</span></div>
        <div className="stat"><span className="stat-num" style={{ color: pendingSpecs > 0 ? "var(--amber)" : "var(--muted)" }}>{pendingSpecs}</span><span className="stat-label">pending</span></div>
      </div>

      <div className="filter-chips">
        {["All", ...STAGES, "Churned"].map((s) => (
          <button key={s} className={"chip" + (stageFilter === s ? " active" : "")} onClick={() => setStageFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="search-box">
        <Search size={14} color="var(--muted-2)" />
        <input placeholder="Search clients or specs" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <button className="add-btn" onClick={onAddClient}><Plus size={15} /> New client</button>

      <div className="client-list">
        {filtered.length === 0 && <div className="empty-sidebar">No clients match. Adjust filters or add one.</div>}
        {filtered.map((c) => {
          const gtdDone = (c.gtd || []).filter((s) => s.done).length;
          const gtdTotal = (c.gtd || []).length;
          const dur = daysSince(c.stageEnteredAt);
          const stuck = dur !== null && dur > STUCK_STAGE_DAYS && !c.churned;
          return (
            <div key={c.id} className={"client-item" + (c.id === selectedId ? " active" : "")} onClick={() => onSelect(c.id)}>
              <div className="client-item-name">
                <span className="priority-dot" style={{ background: PRIORITY_COLORS[c.priority || "Medium"] }} title={(c.priority || "Medium") + " priority"} />
                {c.name || "Untitled client"}
              </div>
              <div className="client-item-meta">
                <span className="stage-pill" style={{ background: c.churned ? STAGE_COLORS.Churned : STAGE_COLORS[c.stage] }}>{c.churned ? "Churned" : c.stage}</span>
                {c.issues.filter((i) => !i.resolved).length > 0 && (
                  <span className="mono" style={{ fontSize: 11, color: "var(--red)" }}>{c.issues.filter((i) => !i.resolved).length} open</span>
                )}
              </div>
              <div className="client-item-sub">
                <span>{timeAgo(c.updatedAt)} · GTD {gtdDone}/{gtdTotal}</span>
                {stuck && <span className="stuck-flag">stuck</span>}
                {isOverdue(c.nextActionDate) && !c.churned && <span className="overdue-flag">overdue</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <button className="btn btn-sm" onClick={onExport}><Download size={13} /> Export</button>
        <button className="btn btn-sm" onClick={() => fileInputRef.current.click()}><Upload size={13} /> Import</button>
        <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onImport} />
      </div>
    </div>
  );
}
