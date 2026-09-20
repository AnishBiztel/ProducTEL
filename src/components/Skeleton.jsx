export function SkeletonLine({ width = "100%", height = 12, style }) {
  return <div className="skeleton skeleton-line" style={{ width, height, ...style }} />;
}

export function SkeletonBlock({ height = 60, style }) {
  return <div className="skeleton skeleton-block" style={{ height, ...style }} />;
}

// Sidebar-shaped skeleton: stat row + a handful of client-item-shaped rows
export function SidebarSkeleton() {
  return (
    <div className="sidebar-skeleton">
      <SkeletonLine width="60%" height={14} />
      <div style={{ height: 18 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton skeleton-avatar" style={{ width: 8, height: 8, borderRadius: "50%" }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine width={`${60 + (i % 3) * 10}%`} height={11} style={{ marginBottom: 6 }} />
            <SkeletonLine width="40%" height={9} style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard-shaped skeleton: a header bar + a few card-shaped blocks
export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      <SkeletonLine width={180} height={20} style={{ marginBottom: 22 }} />
      <SkeletonBlock height={70} style={{ marginBottom: 22 }} />
      <div style={{ display: "flex", gap: 14 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ flex: 1 }}>
            <SkeletonLine width="50%" height={13} style={{ marginBottom: 12 }} />
            <SkeletonBlock height={90} style={{ marginBottom: 10 }} />
            <SkeletonBlock height={90} />
          </div>
        ))}
      </div>
    </div>
  );
}
