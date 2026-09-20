import { useState } from "react";
import { Plus } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function FeatureInbox({ items, onAdd, onUpdate, onDelete }) {
  const [title, setTitle] = useState("");
  const inboxItems = items.filter((i) => i.status === "Inbox");

  function submit() {
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  }

  return (
    <div className="main-inner">
      <div className="page-header">
        <div>
          <div className="page-title">Idea &amp; Feature Inbox</div>
          <div className="page-sub">Dump anything here — feature ideas, bug fixes, random requests. Sort it later.</div>
        </div>
      </div>

      <div className="issue-add" style={{ marginBottom: 22 }}>
        <input
          className="input"
          placeholder="Quick-add a title — e.g. 'Add dark mode toggle'…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button className="btn btn-primary" onClick={submit}><Plus size={14} /> Add</button>
      </div>

      {inboxItems.length === 0 && <div className="no-items">Inbox is empty — nice, or you just haven't dumped anything yet.</div>}
      {inboxItems.map((item) => (
        <FeatureCard key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
