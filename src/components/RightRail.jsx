import { useMemo } from "react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { STAGES, STAGE_COLORS } from "../lib/constants";
import { daysSince } from "../lib/helpers";

export default function RightRail({ allClients, onSelectClient }) {
  const stats = useMemo(() => {
    const active = allClients.filter((c) => !c.churned);
    const openIssues = active.reduce((sum, c) => sum + c.issues.filter((i) => !i.resolved).length, 0);
    const pendingTasks = allClients.reduce(
      (sum, c) => sum + c.specs.filter((s) => s.status === "Draft" || s.status === "Reviewed with Eng").length,
      0
    );
    const pastLead = active.filter((c) => c.stage !== "Lead").length;
    const velocity = active.length ? Math.round((pastLead / active.length) * 100) : 0;
    return { activeCount: active.length, openIssues, pendingTasks, velocity };
  }, [allClients]);

  const distribution = useMemo(() => {
    const active = allClients.filter((c) => !c.churned);
    return STAGES.map((stage) => ({
      stage,
      count: active.filter((c) => c.stage === stage).length,
    })).filter((d) => d.count > 0);
  }, [allClients]);

  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const checklist = useMemo(() => {
    const items = [];
    allClients.forEach((c) => {
      if (c.churned) return;
      (c.gtd || [])
        .filter((s) => !s.done)
        .forEach((s) => items.push({ id: `${c.id}-${s.id}`, clientId: c.id, clientName: c.name, label: s.label, alert: false }));
      c.issues
        .filter((i) => !i.resolved)
        .forEach((i) => items.push({ id: `${c.id}-${i.id}`, clientId: c.id, clientName: c.name, label: i.text, alert: true }));
    });
    return items.sort((a, b) => (b.alert ? 1 : 0) - (a.alert ? 1 : 0)).slice(0, 8);
  }, [allClients]);

  return (
    <aside className="right-rail">
      <div className="right-rail-section">
        <div className="right-rail-title">Dashboard insights</div>
        <div className="rail-kpi-grid">
          <div className="rail-kpi"><div className="rail-kpi-num">{stats.activeCount}</div><div className="rail-kpi-label">Active clients</div></div>
          <div className="rail-kpi"><div className="rail-kpi-num" style={{ color: stats.openIssues ? "var(--red)" : "var(--ink)" }}>{stats.openIssues}</div><div className="rail-kpi-label">Open issue{stats.openIssues === 1 ? "" : "s"}</div></div>
          <div className="rail-kpi"><div className="rail-kpi-num" style={{ color: stats.pendingTasks ? "var(--amber)" : "var(--ink)" }}>{stats.pendingTasks}</div><div className="rail-kpi-label">Pending tasks</div></div>
          <div className="rail-kpi"><div className="rail-kpi-num">{stats.velocity}%</div><div className="rail-kpi-label">Pipeline velocity</div></div>
        </div>
      </div>

      <div className="right-rail-section">
        <div className="right-rail-title">Project status distribution</div>
        {distribution.length === 0 && <div className="no-items" style={{ padding: "8px 0" }}>No active clients yet.</div>}
        {distribution.map((d) => (
          <div className="rail-dist-row" key={d.stage}>
            <span className="rail-dist-dot" style={{ background: STAGE_COLORS[d.stage] }} />
            <span className="rail-dist-label">{d.stage}</span>
            <div className="rail-dist-bar"><div className="rail-dist-bar-fill" style={{ width: (d.count / maxCount) * 100 + "%", background: STAGE_COLORS[d.stage] }} /></div>
            <span className="rail-dist-count">{d.count}</span>
          </div>
        ))}
      </div>

      <div className="right-rail-section">
        <div className="right-rail-title">Action checklist</div>
        {checklist.length === 0 && <div className="no-items" style={{ padding: "8px 0" }}>Nothing pending — nice.</div>}
        {checklist.map((item) => (
          <div className="rail-checklist-row" key={item.id} onClick={() => onSelectClient(item.clientId)}>
            {item.alert ? <AlertCircle size={14} color="var(--red)" /> : <Circle size={14} color="var(--muted-2)" />}
            <div className="rail-checklist-text">
              <div className="rail-checklist-label">{item.label}</div>
              <div className="rail-checklist-client">{item.clientName || "Untitled client"}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
