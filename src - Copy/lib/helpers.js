export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + "d ago";
  const months = Math.floor(days / 30);
  return months + "mo ago";
}

export function daysSince(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.floor(diffMs / 86400000);
}

export function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

export function handleEnterSave(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    e.target.blur();
  }
}

export function initials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  const base = nameOrEmail.split("@")[0];
  const parts = base.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCSV(rows, columns) {
  const escape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(c.value(row))).join(","))
    .join("\n");
  return header + "\n" + body;
}

// Renders @mentions in a comment body as highlighted spans (plain text in, array of parts out)
export function parseMentions(text) {
  const parts = [];
  const re = /(@[a-zA-Z0-9._-]+)/g;
  let lastIndex = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    parts.push({ type: "mention", value: match[1] });
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });
  return parts;
}
