import { createContext, useCallback, useContext, useRef, useState } from "react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null); // { title, description, danger, resolve }
  const resolver = useRef(null);

  const confirm = useCallback((description, opts = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({ title: opts.title || "Are you sure?", description, danger: opts.danger !== false, confirmLabel: opts.confirmLabel || "Delete" });
    });
  }, []);

  function close(result) {
    resolver.current?.(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={() => close(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{state.title}</div>
            <div className="modal-body">{state.description}</div>
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => close(false)}>
                Cancel
              </button>
              <button className={"btn btn-sm" + (state.danger ? " btn-danger" : " btn-primary")} onClick={() => close(true)} autoFocus>
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// Returns a function: await confirmFn(description, options) -> boolean
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
