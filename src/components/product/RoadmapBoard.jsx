import { ROADMAP_COLUMNS, FEATURE_STATUS_COLORS } from "../../lib/constants";
import FeatureCard from "./FeatureCard";

export default function RoadmapBoard({ items, onUpdate, onDelete }) {
  const onRoadmap = items.filter((i) => ROADMAP_COLUMNS.includes(i.status));

  return (
    <div className="main-inner">
      <div className="page-header">
        <div>
          <div className="page-title">Roadmap</div>
        </div>
      </div>

      <div className="kanban" style={{ alignItems: "flex-start" }}>
        {ROADMAP_COLUMNS.map((col) => {
          const cards = onRoadmap.filter((i) => i.status === col);
          return (
            <div className="kanban-col" style={{ flex: "1 1 0", minWidth: 260 }} key={col}>
              <div className="kanban-col-head">
                <div className="kanban-col-title">
                  <span className="kanban-col-dot" style={{ background: FEATURE_STATUS_COLORS[col] }} />
                  {col}
                </div>
                <span className="kanban-col-count">{cards.length}</span>
              </div>
              <div className="kanban-cards">
                {cards.length === 0 && <div className="kanban-empty-col">Nothing here</div>}
                {cards.map((item) => (
                  <FeatureCard key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
