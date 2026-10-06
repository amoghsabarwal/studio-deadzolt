// Runs an effect's setup in a task of its own. When a page mounts, React runs
// every effect in one go; with each animation set up in its own task the
// browser can answer a tap between them instead of after all of them.
// Returns a cleanup that cancels the setup if it hasn't run, or undoes it.
export function inOwnTask(setup: () => void | (() => void)) {
  let cleanup: void | (() => void);
  let done = false;
  const id = setTimeout(() => {
    if (!done) cleanup = setup();
  }, 0);
  return () => {
    done = true;
    clearTimeout(id);
    cleanup?.();
  };
}
