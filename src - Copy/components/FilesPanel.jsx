import { useState, useEffect, useRef } from "react";
import { FileText, Upload, Download, Trash2 } from "lucide-react";
import { listFiles, uploadFile, getFileUrl, deleteFile } from "../lib/api";
import { logActivity } from "../lib/api";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function FilesPanel({ clientId, userEmail }) {
  const [files, setFiles] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errored, setErrored] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();
  const confirmDialog = useConfirm();

  async function load() {
    try {
      const list = await listFiles(clientId);
      setFiles(list.filter((f) => f.name !== ".emptyFolderPlaceholder"));
      setErrored(false);
    } catch (e) {
      setErrored(true);
      setFiles([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function handleFiles(fileList) {
    const list = Array.from(fileList || []);
    if (!list.length) return;
    setUploading(true);
    try {
      for (const file of list) {
        await uploadFile(clientId, file);
        await logActivity(clientId, userEmail, "file_uploaded", `attached a file (${file.name})`);
      }
      await load();
    } catch (e) {
      toast.error("Upload failed", e.message, () => handleFiles(fileList));
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(name) {
    try {
      const url = await getFileUrl(clientId, name);
      window.open(url, "_blank");
    } catch (e) {
      toast.error("Couldn't open file", e.message, () => handleDownload(name));
    }
  }

  async function handleDelete(name) {
    const ok = await confirmDialog(`Delete "${name}"? This can't be undone.`);
    if (!ok) return;
    try {
      await deleteFile(clientId, name);
      await logActivity(clientId, userEmail, "file_deleted", `removed a file (${name})`);
      load();
    } catch (e) {
      toast.error("Couldn't delete file", e.message, () => handleDelete(name));
    }
  }

  return (
    <div className="section">
      <div className="section-title">Files</div>

      {errored && (
        <div className="alert alert-error">
          File storage isn't set up yet. Create a private bucket named <b>client-files</b> in your Supabase
          project (Storage → New bucket) and re-run <span className="mono">supabase-setup.sql</span>.
        </div>
      )}

      <div
        className={"dropzone" + (dragging ? " dragging" : "")}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload size={18} style={{ marginBottom: 6 }} />
        <div>{uploading ? "Uploading…" : "Drag files here, or click to browse"}</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files === null && <div className="no-items">Loading…</div>}
      {files && files.length === 0 && !errored && <div className="no-items">No files attached yet.</div>}
      {files &&
        files.map((f) => (
          <div className="file-row" key={f.id || f.name}>
            <FileText size={16} color="var(--muted)" />
            <div className="file-name">{f.name.replace(/^\d+-/, "")}</div>
            <div className="file-meta">{formatSize(f.metadata?.size)}</div>
            <button className="icon-btn" aria-label="Download" onClick={() => handleDownload(f.name)}>
              <Download size={14} />
            </button>
            <button className="icon-btn danger" aria-label="Delete" onClick={() => handleDelete(f.name)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
    </div>
  );
}
