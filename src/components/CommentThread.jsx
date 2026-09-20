import { useState, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
import { fetchComments, addComment, deleteComment } from "../lib/api";
import { timeAgo, initials, parseMentions, handleEnterSave } from "../lib/helpers";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";

export default function CommentThread({ clientId, targetType, targetId, userEmail, canDelete }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState("");
  const toast = useToast();
  const confirmDialog = useConfirm();

  async function load() {
    try {
      const all = await fetchComments(clientId);
      setComments(all.filter((c) => c.target_type === targetType && c.target_id === targetId));
    } catch (e) {
      setComments([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, targetType, targetId]);

  async function submit() {
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      await addComment(clientId, targetType, targetId, userEmail, body);
      load();
    } catch (e) {
      toast.error("Couldn't post comment", e.message, submit);
      setText(body);
    }
  }

  async function remove(id) {
    const ok = await confirmDialog("Delete this comment? This can't be undone.");
    if (!ok) return;
    try {
      await deleteComment(id);
      load();
    } catch (e) {
      toast.error("Couldn't delete comment", e.message, () => remove(id));
    }
  }

  return (
    <div className="comment-thread">
      <div className="field-label" style={{ marginBottom: 10 }}>
        Discussion {comments && comments.length ? `(${comments.length})` : ""}
      </div>
      {comments === null && <div className="no-items">Loading…</div>}
      {comments && comments.length === 0 && <div className="no-items">No comments yet.</div>}
      {comments &&
        comments.map((c) => (
          <div className="comment-row" key={c.id}>
            <div className="user-avatar">{initials(c.user_email)}</div>
            <div className="comment-body">
              <div className="comment-head">
                <span className="comment-author">{c.user_email}</span>
                <span className="comment-time">{timeAgo(c.created_at)}</span>
                {(canDelete || c.user_email === userEmail) && (
                  <button className="icon-btn danger" style={{ marginLeft: "auto" }} onClick={() => remove(c.id)} title="Delete">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div className="comment-text">
                {parseMentions(c.body).map((p, i) =>
                  p.type === "mention" ? (
                    <span className="mention" key={i}>{p.value}</span>
                  ) : (
                    <span key={i}>{p.value}</span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      <div className="comment-add">
        <input
          className="input"
          placeholder="Add a comment — use @name to mention a teammate…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="btn btn-primary btn-sm" onClick={submit}>
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
