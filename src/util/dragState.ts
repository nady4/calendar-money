const SUPPRESS_WINDOW_MS = 600;

let lastDropAt = 0;
let suppressInstalled = false;

const justDropped = {
  mark() {
    lastDropAt = Date.now();
  },
  isRecent() {
    return Date.now() - lastDropAt < SUPPRESS_WINDOW_MS;
  }
};

const installClickSuppression = () => {
  if (suppressInstalled || typeof window === "undefined") return;
  suppressInstalled = true;

  const stop = (event: MouseEvent) => {
    if (!justDropped.isRecent()) return;
    event.stopImmediatePropagation();
    event.preventDefault();
  };

  window.addEventListener(
    "click",
    stop,
    { capture: true }
  );
  window.addEventListener(
    "mousedown",
    stop,
    { capture: true }
  );
  window.addEventListener(
    "mouseup",
    stop,
    { capture: true }
  );
};

installClickSuppression();

export { justDropped };