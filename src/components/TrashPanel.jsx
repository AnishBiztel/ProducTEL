import { useState, useEffect } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { fetchTrashedClients, restoreClient, permanentlyDeleteClient } from "../lib/api";
import { timeAgo } from "../lib/helpers";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";
import { SkeletonLine } from "./Skeleton";

export default function TrashPanel({ isAdmin, onChanged }) {
  const [items, setItems] = useState(null);
  const toast = useToast();
  const confirmDialog = useConfirm();

  async function load() {
    try {
      setItems(await fetchTrashedClients());
    } catch (e) {
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRestore(id) {
    try {
      await restoreClient(id);
      load();
      onChanged?.();
    } catch (e) {
      toast.error("Couldn't restore", e.message, () => handleRestore(id));
    }
  }

  async function handleDeleteForever(id, name) {
    const ok = await confirmDialog(`Permanently delete "${name || "this client"}"? This cannot be undone.`, { confirmLabel: "Delete forever" });
    if (!ok) return;
    try {
      await permanentlyDeleteClient(id);
      load();
      toast.success("Deleted permanently", `"${name || "Client"}" is gone for good.`);
    } catch (e) {
      toast.error("Couldn't delete", e.message, () => handleDeleteForever(id, name));
    }
  }

  return (
    <div className="main-inner">
      <div className="page-header">
        <div>
          <div className="page-title">Trash</div>
          <div className="page-sub">Deleted clients stay here until restored or permanently removed.</div>
        </div>
      </div>

      {items === null &&
        Array.from({ length: 3 }).map((_, i) => (
          <div className="trash-row" key={i}>
            <div style={{ flex: 1 }}>
              <SkeletonLine width="35%" height={13} style={{ marginBottom: 6 }} />
              <SkeletonLine width="20%" height={10} style={{ marginBottom: 0 }} />
            </div>
          </div>
        ))}
      {items && items.length === 0 && <div className="no-items">Trash is empty.</div>}
      {items &&
        items.map((c) => (
          <div className="trash-row" key={c.id}>
            <div style={{ flex: 1 }}>
              <div className="trash-row-name">{c.name || "Untitled client"}</div>
              <div className="trash-row-meta">deleted {timeAgo(c.deletedAt)}</div>
            </div>
            <button className="btn btn-sm" onClick={() => handleRestore(c.id)}>
              <RotateCcw size={13} /> Restore
            </button>
            {isAdmin && (
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteForever(c.id, c.name)}>
                <Trash2 size={13} /> Delete forever
              </button>
            )}
          </div>
        ))}
      {!isAdmin && items && items.length > 0 && (
        <div className="section-sub">Only workspace admins can permanently delete a client.</div>
      )}
    </div>
  );
}
