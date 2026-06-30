(() => {
  const BAR_ID = "__evistamp_bar__";

  // Second click removes the stamp and restores the page.
  const existing = document.getElementById(BAR_ID);
  if (existing) {
    existing.remove();
    document.documentElement.style.removeProperty("margin-top");
    return;
  }

  const BAR_HEIGHT = 32; // px — also the amount the page is pushed down

  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(); // frozen at the moment you click — no live updating
  // Strict ISO 8601, UTC, second precision: 2026-07-01T13:02:47Z
  const stamp =
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;

  // Apply every declaration as !important so page CSS can't override or hide us.
  const setStyle = (el, styles) => {
    for (const [k, v] of Object.entries(styles)) el.style.setProperty(k, v, "important");
  };

  const SYSTEM_UI =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
  const INK = "#16213a"; // ink navy
  const MUTED = "#5a6883"; // muted navy for the label
  const RULE = "#c9ced6"; // hairline gray

  const bar = document.createElement("div");
  bar.id = BAR_ID;
  setStyle(bar, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    height: BAR_HEIGHT + "px",
    "z-index": "2147483647",
    margin: "0",
    padding: "0",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    gap: "12px",
    background: "#f5f6f8",
    "border-bottom": "1px solid " + RULE,
    "box-shadow": "0 1px 2px rgba(15, 23, 42, 0.06)",
    "font-family": SYSTEM_UI,
    "pointer-events": "none",
    "user-select": "none",
    "box-sizing": "border-box",
  });

  const label = document.createElement("span");
  label.textContent = "CAPTURED (UTC)";
  setStyle(label, {
    "font-family": SYSTEM_UI,
    "font-size": "10.5px",
    "font-weight": "600",
    "letter-spacing": "1.1px",
    "text-transform": "uppercase",
    color: MUTED,
    margin: "0",
    padding: "0",
  });

  const divider = document.createElement("span");
  setStyle(divider, {
    width: "1px",
    height: "15px",
    background: RULE,
    margin: "0",
    padding: "0",
    "flex-shrink": "0",
  });

  const time = document.createElement("span");
  time.textContent = stamp;
  setStyle(time, {
    "font-family": MONO,
    "font-size": "13.5px",
    "font-weight": "600",
    "letter-spacing": "0.3px",
    "font-variant-numeric": "tabular-nums",
    color: INK,
    margin: "0",
    padding: "0",
  });

  bar.appendChild(label);
  bar.appendChild(divider);
  bar.appendChild(time);

  (document.documentElement || document.body).appendChild(bar);
  // Push the whole page down so the bar never covers page content.
  document.documentElement.style.setProperty("margin-top", BAR_HEIGHT + "px", "important");
})();
