import { useState, useEffect } from "react";
import { fetchActivity } from "../lib/api";
import { timeAgo } from "../lib/helpers";

export default function ActivityFeed({ clientId }) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchActivity(clientId)
      .then((data) => !cancelled && setActivity(data))
      .catch(() => !cancelled && setActivity([]));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return (
    <div className="section">
      <div className="section-title">Activity</div>
      {activity === null && <div className="no-items">Loading…</div>}
      {activity && activity.length === 0 && <div className="no-items">No activity recorded yet.</div>}
      {activity &&
        activity.map((a) => (
          <div className="activity-row" key={a.id}>
            <div className="activity-dot" />
            <div className="activity-body">
              <div className="activity-text">
                <b>{a.user_email}</b> {a.detail}
              </div>
              <div className="activity-time">{timeAgo(a.created_at)}</div>
            </div>
          </div>
        ))}
    </div>
  );
}
