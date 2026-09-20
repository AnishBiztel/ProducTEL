import { useState, useEffect, useRef } from "react";
import { beginEdit, endEdit } from "../lib/editGuard";

/**
 * Wraps <input> or <textarea>. Keeps keystrokes instant and local, but only
 * calls onCommit ~500ms after the user stops typing (not on every keystroke),
 * and — the actual fix for the "typing glitches" bug — registers with the
 * shared edit guard while focused so realtime sync holds off refreshing data
 * from the server until the cursor leaves the field. Debouncing alone only
 * reduced how often a stray refresh could land mid-keystroke; this closes
 * the race entirely.
 */
export default function DebouncedField({ as = "input", value, onCommit, delay = 500, className = "input", ...rest }) {
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef(null);
  const lastCommitted = useRef(value);
  const focused = useRef(false);

  // Only re-sync from the parent when its value changed for a reason other
  // than our own most recent commit (e.g. another teammate edited it, or a
  // fresh item loaded) — otherwise a delayed echo of our own write would
  // visibly stomp on whatever the user has typed since. Compared as strings
  // since a numeric field's server value (a number) and its locally-typed
  // value (always a string from the input) would otherwise never match.
  useEffect(() => {
    if (String(value ?? "") !== String(lastCommitted.current ?? "")) {
      setLocal(value ?? "");
      lastCommitted.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function commit(v) {
    clearTimeout(timer.current);
    lastCommitted.current = v;
    onCommit(v);
  }

  function handleChange(e) {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(v), delay);
  }

  function handleFocus(e) {
    if (!focused.current) {
      focused.current = true;
      beginEdit();
    }
    rest.onFocus?.(e);
  }

  function handleBlur(e) {
    // Save immediately on blur so tabbing away right after typing never loses it.
    if (String(local ?? "") !== String(lastCommitted.current ?? "")) commit(local);
    if (focused.current) {
      focused.current = false;
      endEdit();
    }
    rest.onBlur?.(e);
  }

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (focused.current) {
        focused.current = false;
        endEdit();
      }
    },
    []
  );

  const Tag = as;
  return <Tag className={className} value={local} onChange={handleChange} {...rest} onFocus={handleFocus} onBlur={handleBlur} />;
}
