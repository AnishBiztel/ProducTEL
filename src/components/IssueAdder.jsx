import { useState } from "react";
import { Plus } from "lucide-react";

export default function IssueAdder({ onAdd }) {
  const [text, setText] = useState("");
  function submit() {
    if (text.trim()) {
      onAdd(text);
      setText("");
    }
  }
  return (
    <div className="issue-add">
      <input
        className="input"
        placeholder="Log a new issue…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <button className="btn btn-sm" onClick={submit}>
        <Plus size={13} /> Add
      </button>
    </div>
  );
}
