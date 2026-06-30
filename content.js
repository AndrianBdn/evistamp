(() => {
  const BAR_ID = "__evistamp_bar__";
  const PICKER_ID = "__evistamp_picker__";

  // Toggle OFF: a second toolbar click removes everything and restores the page.
  const existing = document.getElementById(BAR_ID);
  if (existing) {
    if (window.__evistampCleanup) {
      window.__evistampCleanup();
      delete window.__evistampCleanup;
    }
    document.getElementById(PICKER_ID)?.remove();
    existing.remove();
    document.documentElement.style.removeProperty("margin-top");
    return;
  }

  const BAR_HEIGHT = 32; // px — also the amount the page is pushed down

  // Chrome theme colors (from Chromium's customize_chrome_colors.cc) — pick one to
  // match the browser's chrome color scheme. `bg: null` is the default light band.
  const COLORS = [
    { name: "Default", bg: null },
    { name: "Blue", bg: "#14539A" },
    { name: "Light Blue", bg: "#5D93E4" },
    { name: "Dark Blue", bg: "#1565C0" },
    { name: "Cool Grey", bg: "#787F91" },
    { name: "Midnight Blue", bg: "#37474F" },
    { name: "Teal", bg: "#199DA9" },
    { name: "Dark Teal", bg: "#006E78" },
    { name: "Green", bg: "#275D2B" },
    { name: "Purple", bg: "#5B3689" },
    { name: "Pink", bg: "#A0144F" },
    { name: "Red", bg: "#B71C1C" },
  ];

  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(); // frozen at the moment you click — no live updating
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
  const ACTIVE_RING = "0 0 0 2px #fff, 0 0 0 4px #1a73e8";

  // Same perceived-luminance test steeltab uses, to pick legible foreground colors.
  const isDark = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };

  const paletteFor = (bg) => {
    if (!bg) {
      return {
        band: "#f5f6f8",
        ink: "#16213a",
        label: "#5a6883",
        rule: "#c9ced6",
        border: "#c9ced6",
        shadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      };
    }
    if (isDark(bg)) {
      return {
        band: bg,
        ink: "#ffffff",
        label: "rgba(255, 255, 255, 0.72)",
        rule: "rgba(255, 255, 255, 0.30)",
        border: "rgba(0, 0, 0, 0.22)",
        shadow: "0 1px 3px rgba(0, 0, 0, 0.35)",
      };
    }
    return {
      band: bg,
      ink: "#0e2038",
      label: "rgba(0, 0, 0, 0.58)",
      rule: "rgba(0, 0, 0, 0.22)",
      border: "rgba(0, 0, 0, 0.16)",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.18)",
    };
  };

  // --- Build the band ---
  const bar = document.createElement("div");
  bar.id = BAR_ID;
  bar.title = "Click to change color scheme";
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
    "font-family": SYSTEM_UI,
    cursor: "pointer",
    "user-select": "none",
    "box-sizing": "border-box",
    visibility: "hidden", // revealed once the saved scheme loads (avoids a color flash)
  });

  const label = document.createElement("span");
  label.textContent = "CAPTURED (UTC)";
  setStyle(label, {
    "font-family": SYSTEM_UI,
    "font-size": "10.5px",
    "font-weight": "600",
    "letter-spacing": "1.1px",
    "text-transform": "uppercase",
    margin: "0",
    padding: "0",
  });

  const divider = document.createElement("span");
  setStyle(divider, { width: "1px", height: "15px", margin: "0", padding: "0", "flex-shrink": "0" });

  const time = document.createElement("span");
  time.textContent = stamp;
  setStyle(time, {
    "font-family": MONO,
    "font-size": "13.5px",
    "font-weight": "600",
    "letter-spacing": "0.3px",
    "font-variant-numeric": "tabular-nums",
    margin: "0",
    padding: "0",
  });

  bar.append(label, divider, time);

  // Recolor the band for the chosen scheme and remember which one is active.
  let activeBg = null;
  const applyScheme = (bg) => {
    activeBg = bg;
    const p = paletteFor(bg);
    setStyle(bar, { background: p.band, "border-bottom": "1px solid " + p.border, "box-shadow": p.shadow });
    setStyle(label, { color: p.label });
    setStyle(divider, { background: p.rule });
    setStyle(time, { color: p.ink });
  };

  // --- Color picker (opens on band click) ---
  let picker = null;
  const closePicker = () => {
    picker?.remove();
    picker = null;
  };

  const buildPicker = () => {
    const panel = document.createElement("div");
    panel.id = PICKER_ID;
    setStyle(panel, {
      position: "fixed",
      top: BAR_HEIGHT + 8 + "px",
      left: "50%",
      transform: "translateX(-50%)",
      "z-index": "2147483647",
      background: "#ffffff",
      "border-radius": "12px",
      padding: "12px 14px",
      "box-shadow": "0 2px 8px rgba(0, 0, 0, 0.18), 0 12px 32px rgba(0, 0, 0, 0.18)",
      display: "grid",
      "grid-template-columns": "repeat(6, 1fr)",
      gap: "10px",
      "box-sizing": "border-box",
      cursor: "default",
    });

    for (const c of COLORS) {
      const sw = document.createElement("button");
      sw.title = c.name;
      setStyle(sw, {
        width: "28px",
        height: "28px",
        "border-radius": "50%",
        border: c.bg ? "none" : "1px solid #c9ced6",
        padding: "0",
        cursor: "pointer",
        "box-sizing": "border-box",
        background: c.bg || "linear-gradient(135deg, #fff 50%, #37474f 50%)",
      });
      if (c.bg === activeBg) setStyle(sw, { "box-shadow": ACTIVE_RING });

      sw.addEventListener("click", (e) => {
        e.stopPropagation();
        applyScheme(c.bg);
        chrome.storage?.local.set({ scheme: c.bg || "" });
        panel.querySelectorAll("button").forEach((b) => b.style.removeProperty("box-shadow"));
        sw.style.setProperty("box-shadow", ACTIVE_RING, "important");
      });

      panel.appendChild(sw);
    }
    return panel;
  };

  const togglePicker = () => {
    if (picker) {
      closePicker();
      return;
    }
    picker = buildPicker();
    document.documentElement.appendChild(picker);
  };

  bar.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePicker();
  });

  // Close the picker on outside click / Escape. Listeners are removed on teardown
  // via a window-scoped hook so they don't leak across show/hide cycles.
  const onDocClick = (e) => {
    if (picker && !picker.contains(e.target) && !bar.contains(e.target)) closePicker();
  };
  const onKey = (e) => {
    if (e.key === "Escape") closePicker();
  };
  document.addEventListener("click", onDocClick, true);
  document.addEventListener("keydown", onKey, true);
  window.__evistampCleanup = () => {
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKey, true);
  };

  // --- Mount + push page down ---
  (document.documentElement || document.body).appendChild(bar);
  document.documentElement.style.setProperty("margin-top", BAR_HEIGHT + "px", "important");

  // Load the saved scheme, apply it, then reveal the band.
  chrome.storage?.local.get("scheme", (res) => {
    applyScheme(res && res.scheme ? res.scheme : null);
    setStyle(bar, { visibility: "visible" });
  });
})();
