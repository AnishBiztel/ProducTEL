// Prevents realtime sync from yanking data out from under an actively-focused
// input. While count > 0, callers should skip refreshing from the server;
// once the user blurs out of every field, the deferred refresh (if any) runs.
let count = 0;
let pending = null;

export function beginEdit() {
  count++;
}

export function endEdit() {
  count = Math.max(0, count - 1);
  if (count === 0 && pending) {
    const fn = pending;
    pending = null;
    fn();
  }
}

export function isEditing() {
  return count > 0;
}

// Runs fn now if nothing is being edited, otherwise defers it until the
// last active field is blurred. A newer deferred call replaces an older one.
export function refreshWhenIdle(fn) {
  if (count === 0) fn();
  else pending = fn;
}
