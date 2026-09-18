import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";
import Settings from "./Settings";
import Tracker from "./Tracker";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [view, setView] = useState("tracker"); // tracker | settings

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          background: "#101114",
          color: "#8A8D94",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking session…
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (view === "settings") {
    return <Settings session={session} onBack={() => setView("tracker")} />;
  }

  return <Tracker session={session} onOpenSettings={() => setView("settings")} />;
}
