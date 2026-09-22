import { useMemo } from "react";
import { Activity, ArrowUpRight } from "lucide-react";
import { STAGES, STAGE_COLORS } from "../lib/constants";

function hexToRgba(hex, alpha) {
  const clean = String(hex || "#8B8FA3").replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(value, 16);
  if (Number.isNaN(n)) return `rgba(139,143,163,${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export default function ProjectStatusChart({ clients = [] }) {
  const statusData = useMemo(() => {
    const active = clients.filter((client) => !client.churned);
    const counts = STAGES.map((stage) => ({
      stage,
      count: active.filter((client) => client.stage === stage).length,
      color: STAGE_COLORS[stage],
    }));
    const total = counts.reduce((sum, item) => sum + item.count, 0);
    const churned = clients.filter((client) => client.churned).length;
    return { counts, total, churned };
  }, [clients]);

  let offset = 0;
  const segments = statusData.counts.map((item) => {
    const start = statusData.total ? (offset / statusData.total) * 100 : 0;
    offset += item.count;
    const end = statusData.total ? (offset / statusData.total) * 100 : 0;
    return `${item.color} ${start}% ${end}%`;
  });

  const background = statusData.total
    ? `conic-gradient(${segments.join(", ")})`
    : "conic-gradient(#252a34 0 100%)";

  return (
    <section className="project-status-card" aria-label="Project status overview">
      <div className="project-status-head">
        <div>
          <div className="project-status-kicker"><Activity size={13} /> LIVE PIPELINE</div>
          <h2>Project Status</h2>
        </div>
        <div className="project-status-live"><span /> Live</div>
      </div>

      <div className="project-status-body">
        <div className="project-status-donut-wrap">
          <div className="project-status-donut" style={{ background }} aria-label={`${statusData.total} active projects`}>
            <div className="project-status-donut-inner">
              <strong>{statusData.total}</strong>
              <span>Active projects</span>
            </div>
          </div>
        </div>

        <div className="project-status-list">
          {statusData.counts.map((item) => {
            const percentage = statusData.total ? Math.round((item.count / statusData.total) * 100) : 0;
            return (
              <div className="project-status-row" key={item.stage}>
                <span className="project-status-row-label">
                  <span className="project-status-dot" style={{ background: item.color, boxShadow: `0 0 9px ${hexToRgba(item.color, 0.55)}` }} />
                  {item.stage}
                </span>
                <span className="project-status-row-bar">
                  <span style={{ width: `${percentage}%`, background: item.color }} />
                </span>
                <span className="project-status-count">{item.count}</span>
                <span className="project-status-percent">{percentage}%</span>
                <ArrowUpRight size={13} className="project-status-arrow" />
              </div>
            );
          })}
        </div>
      </div>

      {statusData.churned > 0 && (
        <div className="project-status-footer">
          <span><span className="project-status-dot" style={{ background: STAGE_COLORS.Churned }} /> {statusData.churned} churned</span>
          <span>Excluded from active project distribution</span>
        </div>
      )}
    </section>
  );
}
