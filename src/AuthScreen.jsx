import { useState } from "react";
import { supabase } from "./supabaseClient";

const WORK_DOMAIN = "biztel.ai";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email || !password) {
      setError("Enter both an email and password.");
      return;
    }
    if (!email.toLowerCase().endsWith("@" + WORK_DOMAIN)) {
      setError(`Use your work email (name@${WORK_DOMAIN}).`);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNotice("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
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
        .auth-screen {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, Arial, sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-card {
          width: 340px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 2px;
          padding: 32px 28px;
        }
        .auth-brand {
          display: flex; align-items: center; gap: 8px;
          font-size: 15px; font-weight: 700; margin-bottom: 4px;
        }
        .auth-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; }
        .auth-sub { font-size: 12px; color: var(--muted); margin-bottom: 26px; }
        .auth-field { margin-bottom: 14px; }
        .auth-field label {
          display: block; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--muted); font-weight: 600; margin-bottom: 6px;
        }
        .auth-field input {
          width: 100%; border: 1px solid var(--line); border-radius: 2px;
          padding: 9px 10px; font-size: 13.5px; background: var(--panel2); color: var(--ink);
          outline: none; font-family: inherit; color-scheme: dark;
        }
        .auth-field input:focus { border-color: var(--accent); }
        .auth-hint { font-size: 11px; color: var(--muted); margin-top: 5px; }
        .auth-submit {
          width: 100%; background: var(--accent); color: white; border: none;
          border-radius: 2px; padding: 10px; font-size: 13.5px; font-weight: 600;
          cursor: pointer; margin-top: 6px; font-family: inherit;
        }
        .auth-submit:disabled { opacity: 0.6; cursor: default; }
        .auth-submit:hover:not(:disabled) { opacity: 0.9; }
        .auth-toggle {
          margin-top: 18px; text-align: center; font-size: 12.5px; color: var(--muted);
        }
        .auth-toggle button {
          background: none; border: none; color: var(--accent); cursor: pointer;
          font-size: 12.5px; font-family: inherit; padding: 0; margin-left: 4px;
        }
        .auth-error {
          background: rgba(194, 65, 65, 0.12); border: 1px solid var(--red); color: #E29999;
          font-size: 12px; padding: 8px 10px; border-radius: 2px; margin-bottom: 16px;
        }
        .auth-notice {
          background: var(--accent-soft); border: 1px solid var(--accent); color: var(--ink);
          font-size: 12px; padding: 8px 10px; border-radius: 2px; margin-bottom: 16px;
        }
      `}</style>
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-dot" />
          Client &amp; Spec Tracker
        </div>
        <div className="auth-sub">
          {mode === "signin" ? "Sign in with your work account" : "Create your work account"}
        </div>

        {error && <div className="auth-error">{error}</div>}
        {notice && <div className="auth-notice">{notice}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Work email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`you@${WORK_DOMAIN}`}
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            {mode === "signup" && <div className="auth-hint">At least 6 characters. You can change this anytime from Settings.</div>}
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "signin" ? "No account yet?" : "Already have an account?"}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}>
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
