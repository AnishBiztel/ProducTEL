import { useState, useEffect } from "react";
import { LayoutGrid, Users, Map, BarChart3, Cpu, Search, Bell, Plus, CheckSquare } from "lucide-react";
import { initials } from "../lib/helpers";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "clients", label: "Clients", icon: Users },
  { key: "roadmap", label: "Roadmap", icon: Map },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "hardware", label: "Hardware / BOM", icon: Cpu },
];

function formatNow(d) {
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${time} ${day}-${month}-${year}`;
}

export default function TopNav({ activeTab, onNavigate, notificationCount, userEmail, onOpenSettings, onNewActivity, onCreateTask }) {
  const [now, setNow] = useState(new Date());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topnav">
      <div className="topnav-brand">
        <span className="topnav-logo">PT</span>
        <span className="topnav-brand-name">ProducTEL</span>
      </div>

      <nav className="topnav-tabs" aria-label="Main">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              className={"topnav-tab" + (activeTab === t.key ? " active" : "")}
              onClick={() => onNavigate(t.key)}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </nav>

      <div className="topnav-utility">
        <div className="topnav-search">
          <Search size={13} />
          <input
            placeholder="Quick search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                onNavigate("clients", query.trim());
                setQuery("");
              }
            }}
          />
        </div>
        <button className="topnav-icon-btn" aria-label={`${notificationCount} notifications`} onClick={() => onNavigate("overview")}>
          <Bell size={16} />
          {notificationCount > 0 && <span className="topnav-badge">{notificationCount > 9 ? "9+" : notificationCount}</span>}
        </button>
        <button className="btn btn-sm" onClick={onNewActivity}><Plus size={13} /> New Activity</button>
        <button className="btn btn-sm btn-primary" onClick={onCreateTask}><CheckSquare size={13} /> Create Task</button>
        <span className="topnav-clock">{formatNow(now)}</span>
        <button className="topnav-avatar" aria-label={userEmail} onClick={onOpenSettings}>{initials(userEmail)}</button>
      </div>
    </header>
  );
}
