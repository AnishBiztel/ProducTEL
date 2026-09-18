import { useState, useEffect, useRef } from "react";
import {
  Plus, Search, ChevronRight, ChevronDown, Circle, CheckCircle2, AlertCircle,
  Trash2, FileText, LayoutGrid, Download, Upload, Rocket, Check, ClipboardList,
  LogOut, Settings as SettingsIcon,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const STAGES = ["Lead", "Discovery", "POC", "Contract", "Deployed", "Live Support"];
const SPEC_STATUSES = ["Draft", "Reviewed with Eng", "Approved", "In Progress", "Shipped"];
const PRIORITIES = ["Low", "Medium", "High"];
const STAGE_COLORS = {
  Lead: "#8B8D98",
  Discovery: "#6D6ADB",
  POC: "#B8862F",
  Contract: "#2F5D50",
  Deployed: "#1E7A4C",
  "Live Support": "#1E7A4C",
  Churned: "#B23B3B",
};
const SPEC_COLORS = {
  Draft: "#8B8D98",
  "Reviewed with Eng": "#6D6ADB",
  Approved: "#B8862F",
  "In Progress": "#2F5D50",
  Shipped: "#1E7A4C",
};
const PRIORITY_COLORS = { Low: "#6B7280", Medium: "#B8862F", High: "#B23B3B" };
const GATHERING_COLORS = { Pending: "#6B7280", Answered: "#1E7A4C" };

const DEFAULT_GATHERING_QUESTIONS = [
  { question: "What defects or anomalies need to be detected?" },
  { question: "What is being inspected — part/material, size, color, surface finish?" },
  { question: "What accuracy or tolerance is required for detection?" },
  { question: "What is the production line speed / cycle time?" },
  { question: "What are the environmental conditions (lighting, dust, vibration, temperature)?" },
  { question: "What mounting space is available for the camera and hardware?" },
  { question: "What is the existing infrastructure (network, power, PLC/SCADA integration)?" },
  { question: "What output is required (pass/fail signal, data logging, alerts, reporting)?" },
  { question: "What is the client's current inspection process (manual or automated)?" },
  { question: "Who are the key stakeholders and final decision makers?" },
  { question: "What is the expected timeline and budget range?" },
];

function freshGathering() {
  return DEFAULT_GATHERING_QUESTIONS.map((q) => ({ id: uid(), question: q.question, answer: "", updatedAt: "" }));
}

const DEFAULT_GTD_STEPS = [
  { id: "survey", label: "Site survey & requirements confirmed" },
  { id: "procurement", label: "Hardware procured (camera, lens, lighting, mounting)" },
  { id: "install", label: "On-site installation" },
  { id: "network", label: "Network & integration setup" },
  { id: "calibration", label: "Model calibration & testing" },
  { id: "uat", label: "UAT with client" },
  { id: "golive", label: "Go-live" },
  { id: "training", label: "Client training & handoff" },
  { id: "support", label: "Post-deployment support plan in place" },
];

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function freshGtd() {
  return DEFAULT_GTD_STEPS.map((s) => ({ ...s, done: false, note: "", completedAt: "" }));
}

function timeAgo(iso) {
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

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

function handleEnterSave(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    e.target.blur();
  }
}

function ensureShape(client) {
  return {
    ...client,
    gtd: client.gtd && client.gtd.length ? client.gtd : freshGtd(),
    priority: client.priority || "Medium",
    overview: client.overview || "",
    gathering: client.gathering && client.gathering.length ? client.gathering : freshGathering(),
  };
}

function emptyClient() {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name: "",
    contact: "",
    industry: "",
    stage: "Lead",
    churned: false,
    priority: "Medium",
    overview: "",
    nextAction: "",
    nextActionDate: "",
    lastContact: "",
    issues: [],
    specs: [],
    gtd: freshGtd(),
    gathering: freshGathering(),
    createdAt: now,
    updatedAt: now,
  };
}

function emptySpec() {
  return {
    id: uid(),
    problem: "",
    constraints: "",
    scopeIn: "",
    scopeOut: "",
    status: "Draft",
    owner: "",
    updatedAt: new Date().toISOString(),
  };
}

function fromDb(row) {
  return {
    id: row.id,
    name: row.name || "",
    contact: row.contact || "",
    industry: row.industry || "",
    stage: row.stage || "Lead",
    churned: row.churned || false,
    priority: row.priority || "Medium",
    overview: row.overview || "",
    nextAction: row.next_action || "",
    nextActionDate: row.next_action_date || "",
    lastContact: row.last_contact || "",
    issues: row.issues || [],
    specs: row.specs || [],
    gtd: row.gtd && row.gtd.length ? row.gtd : freshGtd(),
    gathering: row.gathering && row.gathering.length ? row.gathering : freshGathering(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDb(client) {
  return {
    name: client.name,
    contact: client.contact,
    industry: client.industry,
    stage: client.stage,
    churned: client.churned,
    priority: client.priority,
    overview: client.overview,
    next_action: client.nextAction,
    next_action_date: client.nextActionDate || null,
    last_contact: client.lastContact || null,
    issues: client.issues,
    specs: client.specs,
    gtd: client.gtd,
    gathering: client.gathering,
    updated_at: new Date().toISOString(),
  };
}

export default function Tracker({ session, onOpenSettings }) {
  const [clients, setClients] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [expandedSpec, setExpandedSpec] = useState(null);
  const [expandedGathering, setExpandedGathering] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const loadedOnce = useRef(false);
  const fileInputRef = useRef(null);

  async function fetchClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      setSaveState("error");
      return;
    }
    const shaped = data.map(fromDb).map(ensureShape);
    setClients(shaped);
    setSelectedId((prev) => (prev && shaped.some((c) => c.id === prev) ? prev : shaped[0]?.id || null));
    setSaveState("synced");
  }

  useEffect(() => {
    fetchClients();
    loadedOnce.current = true;

    const channel = supabase
      .channel("clients-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (clients === null) {
    return (
      <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: 40, color: "#8A8D94", background: "#101114", minHeight: "100vh" }}>
        Loading tracker…
      </div>
    );
  }

  const selected = clients.find((c) => c.id === selectedId) || null;

  const q = query.trim().toLowerCase();
  const filtered = clients
    .filter((c) => {
      if (stageFilter === "All") return true;
      if (stageFilter === "Churned") return c.churned;
      return !c.churned && c.stage === stageFilter;
    })
    .filter((c) => {
      if (!q) return true;
      const inClient = (c.name + " " + c.industry + " " + c.contact).toLowerCase().includes(q);
      const inSpecs = c.specs.some((s) => (s.problem + " " + s.constraints).toLowerCase().includes(q));
      return inClient || inSpecs;
    })
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => !c.churned).length;
  const openIssues = clients.reduce((sum, c) => sum + c.issues.filter((i) => !i.resolved).length, 0);
  const pendingSpecs = clients.reduce(
    (sum, c) => sum + c.specs.filter((s) => s.status === "Draft" || s.status === "Reviewed with Eng").length,
    0
  );

  async function updateClient(id, patch) {
    const current = clients.find((c) => c.id === id);
    if (!current) return;
    const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
    setClients((cs) => cs.map((c) => (c.id === id ? merged : c)));
    setSaveState("saving");
    const { error } = await supabase.from("clients").update(toDb(merged)).eq("id", id);
    setSaveState(error ? "error" : "synced");
  }

  async function addClient() {
    const c = emptyClient();
    setClients((cs) => [c, ...cs]);
    setSelectedId(c.id);
    setTab("overview");
    setSaveState("saving");
    const { error } = await supabase.from("clients").insert({
      id: c.id,
      ...toDb(c),
      created_by: session?.user?.id || null,
      created_at: c.createdAt,
    });
    setSaveState(error ? "error" : "synced");
  }

  async function deleteClient(id) {
    setClients((cs) => cs.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    await supabase.from("clients").delete().eq("id", id);
  }

  function addSpec(clientId) {
    const s = emptySpec();
    updateClient(clientId, { specs: [s, ...selected.specs] });
    setExpandedSpec(s.id);
    setTab("specs");
  }

  function updateSpec(clientId, specId, patch) {
    const client = clients.find((c) => c.id === clientId);
    const specs = client.specs.map((s) =>
      s.id === specId ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
    );
    updateClient(clientId, { specs });
  }

  function deleteSpec(clientId, specId) {
    const client = clients.find((c) => c.id === clientId);
    updateClient(clientId, { specs: client.specs.filter((s) => s.id !== specId) });
  }

  function addGatheringQuestion(clientId) {
    const client = clients.find((c) => c.id === clientId);
    const q = { id: uid(), question: "", answer: "", updatedAt: "" };
    updateClient(clientId, { gathering: [...(client.gathering || []), q] });
  }

  function updateGatheringItem(clientId, itemId, patch) {
    const client = clients.find((c) => c.id === clientId);
    const gathering = (client.gathering || []).map((q) =>
      q.id === itemId ? { ...q, ...patch, updatedAt: new Date().toISOString() } : q
    );
    updateClient(clientId, { gathering });
  }

  function deleteGatheringItem(clientId, itemId) {
    const client = clients.find((c) => c.id === clientId);
    updateClient(clientId, { gathering: (client.gathering || []).filter((q) => q.id !== itemId) });
  }

  function addIssue(clientId, text) {
    if (!text.trim()) return;
    const client = clients.find((c) => c.id === clientId);
    updateClient(clientId, {
      issues: [{ id: uid(), text, resolved: false, createdAt: new Date().toISOString() }, ...client.issues],
    });
  }

  function toggleIssue(clientId, issueId) {
    const client = clients.find((c) => c.id === clientId);
    updateClient(clientId, {
      issues: client.issues.map((i) => (i.id === issueId ? { ...i, resolved: !i.resolved } : i)),
    });
  }

  function deleteIssue(clientId, issueId) {
    const client = clients.find((c) => c.id === clientId);
    updateClient(clientId, {
      issues: client.issues.filter((i) => i.id !== issueId),
    });
  }

  function updateGtdStep(clientId, stepId, patch) {
    const client = clients.find((c) => c.id === clientId);
    const gtd = (client.gtd || []).map((s) => (s.id === stepId ? { ...s, ...patch } : s));
    updateClient(clientId, { gtd });
  }

  function toggleGtdStep(clientId, stepId) {
    const client = clients.find((c) => c.id === clientId);
    const step = (client.gtd || []).find((s) => s.id === stepId);
    updateGtdStep(clientId, stepId, {
      done: !step.done,
      completedAt: !step.done ? new Date().toISOString() : "",
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(clients, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client-tracker-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) {
          alert("That file doesn't look like a tracker backup.");
          return;
        }
        if (!confirm(`Import ${data.length} client(s) into the shared workspace? This adds them alongside what's already there.`)) return;
        const shaped = data.map(ensureShape).map((c) => ({ ...c, id: uid() }));
        setSaveState("saving");
        const rows = shaped.map((c) => ({
          id: c.id,
          ...toDb(c),
          created_by: session?.user?.id || null,
          created_at: new Date().toISOString(),
        }));
        const { error } = await supabase.from("clients").insert(rows);
        setSaveState(error ? "error" : "synced");
        if (error) alert("Import failed: " + error.message);
        else fetchClients();
      } catch (err) {
        alert("Couldn't read that file — make sure it's a valid backup export.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app">
      <style>{`
        :root {
          --bg: #101114;
          --panel: #17181C;
          --panel2: #1E2025;
          --ink: #DCDDE0;
          --muted: #8A8D94;
          --line: #2C2E33;
          --accent: #3A87C9;
          --accent-soft: #182635;
          --amber: #C9A227;
          --red: #C24141;
          --green: #1E7A4C;
        }
        * { box-sizing: border-box; }
        .app {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, Arial, sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          display: flex;
          font-size: 13px;
        }
        .mono { font-family: "Consolas", "Courier New", monospace; }

        .sidebar {
          width: 288px;
          flex-shrink: 0;
          background: var(--panel);
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }
        .sidebar-head {
          padding: 20px 18px 14px;
          border-bottom: 1px solid var(--line);
        }
        .brand {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .brand-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; }
        .save-state {
          font-size: 11px;
          color: var(--muted);
          margin-top: 4px;
          font-family: "Consolas", "Courier New", monospace;
        }

        .stats-bar { display: flex; gap: 16px; padding: 14px 18px 4px; flex-wrap: wrap; }
        .stat { display: flex; flex-direction: column; gap: 1px; }
        .stat-num { font-family: "Consolas", "Courier New", monospace; font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1; }
        .stat-label { font-size: 9.5px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }

        .filter-chips { display: flex; flex-wrap: wrap; gap: 5px; padding: 12px 18px 4px; }
        .chip {
          font-size: 10.5px; padding: 3px 8px;
          border: 1px solid var(--line); background: transparent; color: var(--muted);
          border-radius: 2px; cursor: pointer;
        }
        .chip:hover { color: var(--ink); border-color: var(--muted); }
        .chip.active { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }

        .search-box {
          margin: 12px 18px 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 2px;
          padding: 7px 10px;
        }
        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 13px;
          width: 100%;
          color: var(--ink);
        }
        .search-box input::placeholder { color: #5A5D64; }

        .add-btn {
          margin: 0 18px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 2px;
          padding: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }
        .add-btn:hover { opacity: 0.9; }

        .client-list { overflow-y: auto; flex: 1; padding: 0 10px 10px; }
        .client-item {
          padding: 10px 10px;
          border-radius: 2px;
          cursor: pointer;
          margin-bottom: 2px;
          border: 1px solid transparent;
        }
        .client-item:hover { background: var(--bg); }
        .client-item.active { background: var(--accent-soft); border-color: var(--accent); }
        .client-item-name { font-weight: 600; font-size: 13.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .priority-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .client-item-meta { display: flex; align-items: center; gap: 6px; }
        .stage-pill {
          font-size: 10.5px;
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 2px;
          color: white;
          font-family: "Consolas", "Courier New", monospace;
        }
        .client-item-sub {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 5px; font-size: 10.5px; color: var(--muted); font-family: "Consolas", "Courier New", monospace;
        }
        .overdue-flag { color: var(--red); font-weight: 700; }
        .empty-sidebar { padding: 30px 20px; color: var(--muted); font-size: 13px; text-align: center; }

        .user-row {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          padding: 12px 18px 0; border-top: 1px solid var(--line); margin-top: 8px;
        }
        .user-email {
          font-size: 11px; color: var(--muted); font-family: "Consolas", "Courier New", monospace;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .user-row-actions { display: flex; gap: 2px; flex-shrink: 0; }
        .sidebar-footer { display: flex; gap: 8px; padding: 12px 18px; border-top: none; }
        .sidebar-footer .small-btn { flex: 1; justify-content: center; font-size: 11px; padding: 7px; }

        .main { flex: 1; overflow-y: auto; height: 100vh; }
        .empty-main {
          display: flex; align-items: center; justify-content: center;
          height: 100%; color: var(--muted); flex-direction: column; gap: 10px;
        }

        .main-inner { max-width: 880px; margin: 0 auto; padding: 34px 40px 80px; }

        .client-header input.name-input {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, Arial, sans-serif;
          font-size: 26px;
          font-weight: 700;
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          color: var(--ink);
          padding: 2px 0;
        }
        .client-header input.name-input::placeholder { color: #5A5D64; }

        .meta-row { display: flex; gap: 24px; margin-top: 4px; flex-wrap: wrap; align-items: flex-end; }
        .meta-field { display: flex; flex-direction: column; gap: 3px; }
        .meta-field label {
          font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); font-weight: 500;
        }
        .meta-field input, .meta-field select {
          border: none; border-bottom: 1px solid transparent; background: transparent;
          font-size: 13.5px; outline: none; padding: 2px 0; color: var(--ink);
          font-family: inherit; min-width: 140px; color-scheme: dark;
        }
        .meta-field input:hover, .meta-field input:focus,
        .meta-field select:hover, .meta-field select:focus { border-bottom-color: var(--line); }
        .meta-field input::placeholder { color: #5A5D64; }

        .overview-box { margin-top: 16px; }
        .overview-box label {
          display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); font-weight: 500; margin-bottom: 5px;
        }
        .overview-textarea {
          width: 100%; border: 1px solid var(--line); border-radius: 2px;
          padding: 9px 11px; font-size: 13px; font-family: inherit; outline: none;
          resize: vertical; min-height: 44px; background: var(--panel2); color: var(--ink);
        }
        .overview-textarea::placeholder { color: #5A5D64; }
        .overview-textarea:focus { border-color: var(--accent); }

        .pipeline {
          margin-top: 26px;
          display: flex;
          align-items: center;
        }
        .pipeline-node-wrap { display: flex; align-items: center; flex: 1; }
        .pipeline-node {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          cursor: pointer; flex-shrink: 0;
        }
        .pipeline-dot {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid var(--line); background: var(--panel2);
          transition: all 0.15s;
        }
        .pipeline-dot.done { background: var(--accent); border-color: var(--accent); }
        .pipeline-dot.current { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
        .pipeline-label {
          font-size: 10px; color: var(--muted); font-family: "Consolas", "Courier New", monospace;
          white-space: nowrap;
        }
        .pipeline-label.active { color: var(--ink); font-weight: 600; }
        .pipeline-track { flex: 1; height: 2px; background: var(--line); margin: 0 -2px; position: relative; top: -10px; }
        .pipeline-track.done { background: var(--accent); }

        .churn-toggle {
          margin-top: 14px; font-size: 12px; color: var(--muted); cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .churn-toggle.active { color: var(--red); font-weight: 600; }

        .tabs { display: flex; gap: 4px; margin-top: 30px; border-bottom: 1px solid var(--line); flex-wrap: wrap; }
        .tab-btn {
          padding: 9px 14px; border: none; background: none; cursor: pointer;
          font-size: 13px; font-weight: 500; color: var(--muted); font-family: inherit;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          display: flex; align-items: center; gap: 6px;
        }
        .tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

        .section { margin-top: 24px; }
        .section-title {
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); font-weight: 600; margin-bottom: 10px;
        }

        .textarea-field {
          width: 100%; border: 1px solid var(--line); border-radius: 2px;
          padding: 10px 12px; font-size: 13.5px; font-family: inherit; outline: none;
          resize: vertical; min-height: 60px; background: var(--panel2); color: var(--ink);
        }
        .textarea-field::placeholder { color: #5A5D64; }
        .textarea-field:focus { border-color: var(--accent); }

        .issue-row {
          display: flex; align-items: center; gap: 8px; padding: 7px 0;
          border-bottom: 1px solid var(--line); font-size: 13px;
        }
        .issue-row.resolved { color: var(--muted); }
        .issue-row .icon-btn { opacity: 0; transition: opacity 0.1s; }
        .issue-row:hover .icon-btn { opacity: 1; }
        .resolved-badge {
          font-size: 10px; font-weight: 600; color: var(--accent); background: var(--accent-soft);
          border: 1px solid var(--accent); border-radius: 2px; padding: 1px 6px;
          text-transform: uppercase; letter-spacing: 0.03em; white-space: nowrap;
        }
        .issue-add { display: flex; gap: 8px; margin-top: 10px; }
        .issue-add input {
          flex: 1; border: 1px solid var(--line); border-radius: 2px; padding: 7px 10px;
          font-size: 13px; outline: none; font-family: inherit; background: var(--panel2); color: var(--ink);
        }
        .issue-add input::placeholder { color: #5A5D64; }
        .issue-add input:focus { border-color: var(--accent); }
        .small-btn {
          border: 1px solid var(--line); background: var(--panel2); border-radius: 2px;
          padding: 7px 12px; font-size: 12.5px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 5px; font-weight: 500; color: var(--ink);
        }
        .small-btn:hover { border-color: var(--accent); color: var(--accent); }

        .spec-card {
          border: 1px solid var(--line); border-radius: 2px; margin-bottom: 10px;
          background: var(--panel); overflow: hidden;
        }
        .spec-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; cursor: pointer;
        }
        .spec-card-title {
          font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 8px;
        }
        .spec-card-head-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .spec-status-pill {
          font-size: 10.5px; font-weight: 500; padding: 2px 8px; border-radius: 2px;
          color: white; font-family: "Consolas", "Courier New", monospace;
        }
        .spec-body { padding: 0 14px 16px; display: flex; flex-direction: column; gap: 12px; }
        .field-label {
          font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); font-weight: 600; margin-bottom: 5px;
        }
        .spec-meta-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .status-select {
          border: 1px solid var(--line); border-radius: 2px; padding: 6px 10px;
          font-size: 12.5px; font-family: inherit; background: var(--panel2); cursor: pointer;
          color: var(--ink); color-scheme: dark;
        }
        .owner-input {
          border: 1px solid var(--line); border-radius: 2px; padding: 6px 10px;
          font-size: 12.5px; font-family: inherit; width: 140px;
          background: var(--panel2); color: var(--ink);
        }
        .owner-input::placeholder { color: #5A5D64; }
        .updated-note { font-size: 11px; color: var(--muted); font-family: "Consolas", "Courier New", monospace; }
        .icon-btn {
          border: none; background: none; cursor: pointer; color: var(--muted);
          padding: 4px; display: flex; align-items: center;
        }
        .icon-btn:hover { color: var(--red); }
        .add-spec-btn {
          display: flex; align-items: center; gap: 6px; border: 1px dashed var(--line);
          border-radius: 2px; padding: 10px; justify-content: center; cursor: pointer;
          color: var(--muted); font-size: 13px; background: none; width: 100%; font-family: inherit;
        }
        .add-spec-btn:hover { border-color: var(--accent); color: var(--accent); }
        .no-specs { color: var(--muted); font-size: 13px; padding: 20px 0; text-align: center; }

        .gtd-progress-wrap { margin-bottom: 20px; }
        .gtd-progress-bar { height: 7px; background: var(--panel2); border: 1px solid var(--line); border-radius: 2px; overflow: hidden; }
        .gtd-progress-fill { height: 100%; background: var(--accent); transition: width 0.2s; }
        .gtd-progress-label { font-size: 11px; color: var(--muted); margin-top: 6px; font-family: "Consolas", "Courier New", monospace; }
        .gtd-step { display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--line); }
        .gtd-step:last-child { border-bottom: none; }
        .gtd-checkbox {
          cursor: pointer; margin-top: 1px; flex-shrink: 0; width: 17px; height: 17px;
          border: 1px solid var(--line); border-radius: 2px; display: flex; align-items: center;
          justify-content: center; background: var(--panel2);
        }
        .gtd-checkbox.checked { background: var(--accent); border-color: var(--accent); }
        .gtd-step-body { flex: 1; }
        .gtd-step-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .gtd-step-label { font-size: 13.5px; font-weight: 500; }
        .gtd-step-label.done { color: var(--muted); text-decoration: line-through; }
        .gtd-step-date { font-size: 10.5px; color: var(--muted); font-family: "Consolas", "Courier New", monospace; white-space: nowrap; }
        .gtd-note-input {
          width: 100%; margin-top: 7px; border: 1px solid var(--line); border-radius: 2px;
          padding: 6px 9px; font-size: 12.5px; background: var(--panel2); color: var(--ink); font-family: inherit;
        }
        .gtd-note-input::placeholder { color: #5A5D64; }
      `}</style>

      <div className="sidebar">
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-dot" />
            Client &amp; Spec Tracker
          </div>
          <div className="save-state">
            {saveState === "saving" ? "syncing…" : saveState === "synced" ? "synced" : saveState === "error" ? "sync failed" : ""}
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat">
            <span className="stat-num">{totalClients}</span>
            <span className="stat-label">clients</span>
          </div>
          <div className="stat">
            <span className="stat-num" style={{ color: "var(--accent)" }}>{activeClients}</span>
            <span className="stat-label">active</span>
          </div>
          <div className="stat">
            <span className="stat-num" style={{ color: openIssues > 0 ? "var(--red)" : "var(--muted)" }}>{openIssues}</span>
            <span className="stat-label">issues</span>
          </div>
          <div className="stat">
            <span className="stat-num" style={{ color: pendingSpecs > 0 ? "var(--amber)" : "var(--muted)" }}>{pendingSpecs}</span>
            <span className="stat-label">pending</span>
          </div>
        </div>

        <div className="filter-chips">
          {["All", ...STAGES, "Churned"].map((s) => (
            <button key={s} className={"chip" + (stageFilter === s ? " active" : "")} onClick={() => setStageFilter(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={14} color="#8A8D94" />
          <input placeholder="Search clients or specs" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleEnterSave} />
        </div>
        <button className="add-btn" onClick={addClient}>
          <Plus size={15} /> New client
        </button>
        <div className="client-list">
          {filtered.length === 0 && <div className="empty-sidebar">No clients match. Adjust filters or add one.</div>}
          {filtered.map((c) => {
            const gtdDone = (c.gtd || []).filter((s) => s.done).length;
            const gtdTotal = (c.gtd || []).length || DEFAULT_GTD_STEPS.length;
            return (
              <div
                key={c.id}
                className={"client-item" + (c.id === selectedId ? " active" : "")}
                onClick={() => {
                  setSelectedId(c.id);
                  setTab("overview");
                }}
              >
                <div className="client-item-name">
                  <span className="priority-dot" style={{ background: PRIORITY_COLORS[c.priority || "Medium"] }} title={(c.priority || "Medium") + " priority"} />
                  {c.name || "Untitled client"}
                </div>
                <div className="client-item-meta">
                  <span
                    className="stage-pill"
                    style={{ background: c.churned ? STAGE_COLORS.Churned : STAGE_COLORS[c.stage] }}
                  >
                    {c.churned ? "Churned" : c.stage}
                  </span>
                  {c.issues.filter((i) => !i.resolved).length > 0 && (
                    <span className="mono" style={{ fontSize: 11, color: "var(--red)" }}>
                      {c.issues.filter((i) => !i.resolved).length} open
                    </span>
                  )}
                </div>
                <div className="client-item-sub">
                  <span>{timeAgo(c.updatedAt)} · GTD {gtdDone}/{gtdTotal}</span>
                  {isOverdue(c.nextActionDate) && !c.churned && <span className="overdue-flag">overdue</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="user-row">
          <span className="user-email" title={session?.user?.email}>{session?.user?.email}</span>
          <div className="user-row-actions">
            <button className="icon-btn" onClick={onOpenSettings} title="Settings">
              <SettingsIcon size={14} />
            </button>
            <button className="icon-btn" onClick={handleLogout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="small-btn" onClick={exportData}>
            <Download size={13} /> Export
          </button>
          <button className="small-btn" onClick={() => fileInputRef.current.click()}>
            <Upload size={13} /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={importData}
          />
        </div>
      </div>

      <div className="main">
        {!selected ? (
          <div className="empty-main">
            <LayoutGrid size={28} strokeWidth={1.5} />
            <div>Select a client, or add a new one to get started.</div>
          </div>
        ) : (
          <div className="main-inner">
            <div className="client-header">
              <input
                className="name-input"
                placeholder="Client name"
                value={selected.name}
                onChange={(e) => updateClient(selected.id, { name: e.target.value })}
                onKeyDown={handleEnterSave}
              />
              <div className="meta-row">
                <div className="meta-field">
                  <label>Contact</label>
                  <input
                    placeholder="Name, role"
                    value={selected.contact}
                    onChange={(e) => updateClient(selected.id, { contact: e.target.value })}
                    onKeyDown={handleEnterSave}
                  />
                </div>
                <div className="meta-field">
                  <label>Industry / use case</label>
                  <input
                    placeholder="e.g. automotive QC"
                    value={selected.industry}
                    onChange={(e) => updateClient(selected.id, { industry: e.target.value })}
                    onKeyDown={handleEnterSave}
                  />
                </div>
                <div className="meta-field">
                  <label>Last contact</label>
                  <input
                    type="date"
                    value={selected.lastContact}
                    onChange={(e) => updateClient(selected.id, { lastContact: e.target.value })}
                  />
                </div>
                <div className="meta-field">
                  <label>Priority</label>
                  <select
                    value={selected.priority || "Medium"}
                    onChange={(e) => updateClient(selected.id, { priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overview-box">
                <label>High-level overview</label>
                <textarea
                  className="overview-textarea"
                  placeholder="One or two lines on where this client stands overall — useful for a quick catch-up before a call."
                  value={selected.overview}
                  onChange={(e) => updateClient(selected.id, { overview: e.target.value })}
                  onKeyDown={handleEnterSave}
                />
              </div>
            </div>

            <div className="pipeline">
              {STAGES.map((stage, i) => {
                const currentIdx = STAGES.indexOf(selected.stage);
                const isDone = i < currentIdx || (i === currentIdx && !selected.churned);
                const isCurrent = i === currentIdx;
                return (
                  <div className="pipeline-node-wrap" key={stage} style={{ flex: i === STAGES.length - 1 ? "0 0 auto" : 1 }}>
                    <div
                      className="pipeline-node"
                      onClick={() => updateClient(selected.id, { stage, churned: false })}
                    >
                      <div className={"pipeline-dot" + (isDone ? " done" : "") + (isCurrent ? " current" : "")} />
                      <div className={"pipeline-label" + (isCurrent ? " active" : "")}>{stage}</div>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={"pipeline-track" + (i < currentIdx ? " done" : "")} />
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={"churn-toggle" + (selected.churned ? " active" : "")}
              onClick={() => updateClient(selected.id, { churned: !selected.churned })}
            >
              {selected.churned ? <AlertCircle size={13} /> : <Circle size={13} />}
              {selected.churned ? "Marked as churned — click to undo" : "Mark as churned"}
            </div>

            <div className="tabs">
              <button className={"tab-btn" + (tab === "overview" ? " active" : "")} onClick={() => setTab("overview")}>
                <LayoutGrid size={14} /> Overview
              </button>
              <button className={"tab-btn" + (tab === "gathering" ? " active" : "")} onClick={() => setTab("gathering")}>
                <ClipboardList size={14} /> Requirement Gathering ({(selected.gathering || []).filter((q) => q.answer.trim()).length}/{(selected.gathering || []).length})
              </button>
              <button className={"tab-btn" + (tab === "specs" ? " active" : "")} onClick={() => setTab("specs")}>
                <FileText size={14} /> Requirements &amp; specs ({selected.specs.length})
              </button>
              <button className={"tab-btn" + (tab === "gtd" ? " active" : "")} onClick={() => setTab("gtd")}>
                <Rocket size={14} /> GTD ({(selected.gtd || []).filter((s) => s.done).length}/{(selected.gtd || []).length})
              </button>
            </div>

            {tab === "overview" && (
              <>
                <div className="section">
                  <div className="section-title">Next action</div>
                  <div className="meta-row" style={{ marginTop: 0 }}>
                    <div className="meta-field" style={{ flex: 1 }}>
                      <label>What's next</label>
                      <input
                        placeholder="e.g. send POC results deck"
                        value={selected.nextAction}
                        onChange={(e) => updateClient(selected.id, { nextAction: e.target.value })}
                        onKeyDown={handleEnterSave}
                        style={{ minWidth: 280 }}
                      />
                    </div>
                    <div className="meta-field">
                      <label>Due</label>
                      <input
                        type="date"
                        value={selected.nextActionDate}
                        onChange={(e) => updateClient(selected.id, { nextActionDate: e.target.value })}
                      />
                    </div>
                    {isOverdue(selected.nextActionDate) && !selected.churned && (
                      <span className="mono overdue-flag" style={{ alignSelf: "center", fontSize: 11 }}>
                        ⚠ overdue
                      </span>
                    )}
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">Issues</div>
                  {selected.issues.length === 0 && <div className="no-specs">No issues logged.</div>}
                  {selected.issues.map((issue) => (
                    <div key={issue.id} className={"issue-row" + (issue.resolved ? " resolved" : "")}>
                      <span onClick={() => toggleIssue(selected.id, issue.id)} style={{ cursor: "pointer", display: "flex" }} title={issue.resolved ? "Mark as open" : "Mark as resolved"}>
                        {issue.resolved ? <CheckCircle2 size={15} color="#3A87C9" /> : <Circle size={15} color="#5A5D64" />}
                      </span>
                      <span style={{ flex: 1 }}>{issue.text}</span>
                      {issue.resolved && <span className="resolved-badge">Resolved</span>}
                      <button className="icon-btn" onClick={() => deleteIssue(selected.id, issue.id)} title="Delete issue">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <IssueAdder onAdd={(text) => addIssue(selected.id, text)} />
                </div>
              </>
            )}

            {tab === "gathering" && (
              <div className="section">
                {(() => {
                  const items = selected.gathering || [];
                  const answered = items.filter((q) => q.answer.trim()).length;
                  const pct = items.length ? Math.round((answered / items.length) * 100) : 0;
                  return (
                    <>
                      <div className="section-title">Requirement gathering — discovery call questions</div>
                      <div className="gtd-progress-wrap">
                        <div className="gtd-progress-bar">
                          <div className="gtd-progress-fill" style={{ width: pct + "%" }} />
                        </div>
                        <div className="gtd-progress-label">{answered} of {items.length} answered ({pct}%)</div>
                      </div>
                      <button className="add-spec-btn" onClick={() => addGatheringQuestion(selected.id)}>
                        <Plus size={14} /> Add question
                      </button>
                      <div style={{ marginTop: 12 }}>
                        {items.length === 0 && <div className="no-specs">No questions yet.</div>}
                        {items.map((item) => {
                          const open = expandedGathering === item.id;
                          const status = item.answer.trim() ? "Answered" : "Pending";
                          return (
                            <div className="spec-card" key={item.id}>
                              <div className="spec-card-head" onClick={() => setExpandedGathering(open ? null : item.id)}>
                                <div className="spec-card-title">
                                  {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                  {item.question ? item.question.slice(0, 70) + (item.question.length > 70 ? "…" : "") : "Untitled question"}
                                </div>
                                <div className="spec-card-head-right">
                                  <span className="spec-status-pill" style={{ background: GATHERING_COLORS[status] }}>
                                    {status}
                                  </span>
                                  <button
                                    className="icon-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm("Delete this question? This can't be undone.")) {
                                        deleteGatheringItem(selected.id, item.id);
                                      }
                                    }}
                                    title="Delete question"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              {open && (
                                <div className="spec-body">
                                  <div>
                                    <div className="field-label">Question</div>
                                    <textarea
                                      className="textarea-field"
                                      placeholder="What do you need to find out from the client?"
                                      value={item.question}
                                      onChange={(e) => updateGatheringItem(selected.id, item.id, { question: e.target.value })}
                                      onKeyDown={handleEnterSave}
                                      style={{ minHeight: 40 }}
                                    />
                                  </div>
                                  <div>
                                    <div className="field-label">Answer</div>
                                    <textarea
                                      className="textarea-field"
                                      placeholder="What the client told you"
                                      value={item.answer}
                                      onChange={(e) => updateGatheringItem(selected.id, item.id, { answer: e.target.value })}
                                      onKeyDown={handleEnterSave}
                                    />
                                  </div>
                                  {item.updatedAt && (
                                    <span className="updated-note">updated {new Date(item.updatedAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {tab === "specs" && (
              <div className="section">
                <button className="add-spec-btn" onClick={() => addSpec(selected.id)}>
                  <Plus size={14} /> Add requirement / spec
                </button>
                <div style={{ marginTop: 12 }}>
                  {selected.specs.length === 0 && (
                    <div className="no-specs">No specs logged yet for this client.</div>
                  )}
                  {selected.specs.map((spec) => {
                    const open = expandedSpec === spec.id;
                    return (
                      <div className="spec-card" key={spec.id}>
                        <div className="spec-card-head" onClick={() => setExpandedSpec(open ? null : spec.id)}>
                          <div className="spec-card-title">
                            {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            {spec.problem ? spec.problem.slice(0, 60) + (spec.problem.length > 60 ? "…" : "") : "Untitled spec"}
                          </div>
                          <div className="spec-card-head-right">
                            <span className="spec-status-pill" style={{ background: SPEC_COLORS[spec.status] }}>
                              {spec.status}
                            </span>
                            <button
                              className="icon-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Delete this spec? This can't be undone.")) {
                                  deleteSpec(selected.id, spec.id);
                                }
                              }}
                              title="Delete spec"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {open && (
                          <div className="spec-body">
                            <div>
                              <div className="field-label">Problem statement</div>
                              <textarea
                                className="textarea-field"
                                placeholder="What does the client actually need, in plain terms?"
                                value={spec.problem}
                                onChange={(e) => updateSpec(selected.id, spec.id, { problem: e.target.value })}
                                onKeyDown={handleEnterSave}
                              />
                            </div>
                            <div>
                              <div className="field-label">Technical constraints</div>
                              <textarea
                                className="textarea-field"
                                placeholder="Accuracy needed, environment, integration points, timelines…"
                                value={spec.constraints}
                                onChange={(e) => updateSpec(selected.id, spec.id, { constraints: e.target.value })}
                                onKeyDown={handleEnterSave}
                              />
                            </div>
                            <div>
                              <div className="field-label">Scope — in</div>
                              <textarea
                                className="textarea-field"
                                placeholder="What we're building for this"
                                value={spec.scopeIn}
                                onChange={(e) => updateSpec(selected.id, spec.id, { scopeIn: e.target.value })}
                                onKeyDown={handleEnterSave}
                              />
                            </div>
                            <div>
                              <div className="field-label">Scope — out</div>
                              <textarea
                                className="textarea-field"
                                placeholder="What we're explicitly not doing, and why"
                                value={spec.scopeOut}
                                onChange={(e) => updateSpec(selected.id, spec.id, { scopeOut: e.target.value })}
                                onKeyDown={handleEnterSave}
                              />
                            </div>
                            <div className="spec-meta-row">
                              <select
                                className="status-select"
                                value={spec.status}
                                onChange={(e) => updateSpec(selected.id, spec.id, { status: e.target.value })}
                              >
                                {SPEC_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <input
                                className="owner-input"
                                placeholder="Owner"
                                value={spec.owner}
                                onChange={(e) => updateSpec(selected.id, spec.id, { owner: e.target.value })}
                                onKeyDown={handleEnterSave}
                              />
                              <span className="updated-note">
                                updated {new Date(spec.updatedAt).toLocaleDateString()}
                              </span>
                              <button
                                className="icon-btn"
                                style={{ marginLeft: "auto" }}
                                onClick={() => deleteSpec(selected.id, spec.id)}
                                title="Delete spec"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "gtd" && (
              <div className="section">
                {(() => {
                  const steps = selected.gtd || [];
                  const done = steps.filter((s) => s.done).length;
                  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
                  return (
                    <>
                      <div className="section-title">Go-To-Deployment — end-to-end rollout checklist</div>
                      <div className="gtd-progress-wrap">
                        <div className="gtd-progress-bar">
                          <div className="gtd-progress-fill" style={{ width: pct + "%" }} />
                        </div>
                        <div className="gtd-progress-label">{done} of {steps.length} steps complete ({pct}%)</div>
                      </div>
                      {steps.map((step) => (
                        <div className="gtd-step" key={step.id}>
                          <div
                            className={"gtd-checkbox" + (step.done ? " checked" : "")}
                            onClick={() => toggleGtdStep(selected.id, step.id)}
                          >
                            {step.done && <Check size={12} color="white" strokeWidth={3} />}
                          </div>
                          <div className="gtd-step-body">
                            <div className="gtd-step-top">
                              <span
                                className={"gtd-step-label" + (step.done ? " done" : "")}
                                onClick={() => toggleGtdStep(selected.id, step.id)}
                                style={{ cursor: "pointer" }}
                              >
                                {step.label}
                              </span>
                              {step.completedAt && (
                                <span className="gtd-step-date">{new Date(step.completedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                            <input
                              className="gtd-note-input"
                              placeholder="Notes — blockers, dates, who's handling it…"
                              value={step.note}
                              onChange={(e) => updateGtdStep(selected.id, step.id, { note: e.target.value })}
                              onKeyDown={handleEnterSave}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}

            <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <button
                className="small-btn"
                onClick={() => {
                  if (confirm("Delete this client and all its specs? This can't be undone.")) {
                    deleteClient(selected.id);
                  }
                }}
              >
                <Trash2 size={13} /> Delete client
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IssueAdder({ onAdd }) {
  const [text, setText] = useState("");
  return (
    <div className="issue-add">
      <input
        placeholder="Log a new issue…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            onAdd(text);
            setText("");
          }
        }}
      />
      <button
        className="small-btn"
        onClick={() => {
          if (text.trim()) {
            onAdd(text);
            setText("");
          }
        }}
      >
        <Plus size={13} /> Add
      </button>
    </div>
  );
}
