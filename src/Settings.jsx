import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function Settings({ session, onBack }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleChangePassword(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNotice("Password updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-screen">
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
          --red: #C24141;
        }
        * { box-sizing: border-box; }
        .settings-screen {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, Arial, sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }
        .settings-inner { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
        .settings-back {
          display: flex; align-items: center; gap: 6px; background: none; border: none;
          color: var(--muted); cursor: pointer; font-size: 13px; font-family: inherit; margin-bottom: 24px; padding: 0;
        }
        .settings-back:hover { color: var(--ink); }
        .settings-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .settings-email { font-size: 12.5px; color: var(--muted); margin-bottom: 28px; font-family: "Consolas", monospace; }
        .settings-card {
          background: var(--panel); border: 1px solid var(--line); border-radius: 2px; padding: 24px;
        }
        .settings-section-title { font-size: 13px; font-weight: 600; margin-bottom: 16px; }
        .settings-field { margin-bottom: 14px; }
        .settings-field label {
          display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); font-weight: 600; margin-bottom: 6px;
        }
        .settings-field input {
          width: 100%; border: 1px solid var(--line); border-radius: 2px;
          padding: 9px 10px; font-size: 13.5px; background: var(--panel2); color: var(--ink);
          outline: none; font-family: inherit; color-scheme: dark;
        }
        .settings-field input:focus { border-color: var(--accent); }
        .settings-submit {
          background: var(--accent); color: white; border: none;
          border-radius: 2px; padding: 9px 16px; font-size: 13px; font-weight: 600;
          cursor: pointer; margin-top: 4px; font-family: inherit;
        }
        .settings-submit:disabled { opacity: 0.6; cursor: default; }
        .settings-submit:hover:not(:disabled) { opacity: 0.9; }
        .settings-error {
          background: rgba(194, 65, 65, 0.12); border: 1px solid var(--red); color: #E29999;
          font-size: 12px; padding: 8px 10px; border-radius: 2px; margin-bottom: 14px;
        }
        .settings-notice {
          background: var(--accent-soft); border: 1px solid var(--accent); color: var(--ink);
          font-size: 12px; padding: 8px 10px; border-radius: 2px; margin-bottom: 14px;
        }
      `}</style>
      <div className="settings-inner">
        <button className="settings-back" onClick={onBack}>
          <ArrowLeft size={14} /> Back to tracker
        </button>
        <div className="settings-title">Settings</div>
        <div className="settings-email">Signed in as {session?.user?.email}</div>

        <div className="settings-card">
          <div className="settings-section-title">Change password</div>
          {error && <div className="settings-error">{error}</div>}
          {notice && <div className="settings-notice">{notice}</div>}
          <form onSubmit={handleChangePassword}>
            <div className="settings-field">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div className="settings-field">
              <label>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button className="settings-submit" type="submit" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
