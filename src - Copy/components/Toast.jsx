import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((ts) => ts.filter((t) => t.id !== id));
    }, 180);
    clearTimeout(timers.current[id]);
  }, []);

  const toast = useCallback(
    ({ type = "info", title, description, retry, duration = 5000 }) => {
      const id = ++idCounter;
      setToasts((ts) => [...ts, { id, type, title, description, retry }]);
      if (duration) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const value = {
    toast,
    dismiss,
    error: (title, description, retry) => toast({ type: "error", title, description, retry, duration: retry ? 8000 : 5000 }),
    success: (title, description) => toast({ type: "success", title, description, duration: 3500 }),
    info: (title, description) => toast({ type: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport">
        {toasts.map((t) => (
          <div className={"toast" + (t.leaving ? " leaving" : "")} key={t.id}>
            <span className={"toast-icon " + t.type}>
              {t.type === "error" ? <AlertCircle size={17} /> : t.type === "success" ? <CheckCircle2 size={17} /> : <Info size={17} />}
            </span>
            <div className="toast-body">
              <div className="toast-title">{t.title}</div>
              {t.description && <div className="toast-desc">{t.description}</div>}
              {t.retry && (
                <div className="toast-actions">
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      dismiss(t.id);
                      t.retry();
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
            <button className="toast-close" onClick={() => dismiss(t.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
