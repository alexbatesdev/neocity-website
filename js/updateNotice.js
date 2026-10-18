(() => {
  const STORAGE_KEY = "siteVersionSeen";
  const TOAST_MS = 10000;

  async function checkForUpdate() {
    let current;
    try {
      // no-store bypasses the HTTP cache so we always see the latest deploy
      const res = await fetch("/version.json", { cache: "no-store" });
      if (!res.ok) return;
      current = (await res.json()).version;
    } catch {
      return;
    }
    if (!current) return;

    const seen = localStorage.getItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY, current);
    // First-ever visit: nothing to announce
    if (seen && seen !== current) showToast();
  }

  function loadXpFont() {
    // @font-face is ignored inside shadow roots, so it must live in the document
    if (document.getElementById("xp-font-face")) return;
    const style = document.createElement("style");
    style.id = "xp-font-face";
    const base = "https://unpkg.com/xp.css@0.2.6/dist/";
    style.textContent = `@font-face{font-family:"Pixelated MS Sans Serif";src:url(${base}ms_sans_serif.woff2) format("woff2"),url(${base}ms_sans_serif.woff) format("woff");font-weight:400;font-style:normal}
@font-face{font-family:"Pixelated MS Sans Serif";src:url(${base}ms_sans_serif_bold.woff2) format("woff2"),url(${base}ms_sans_serif_bold.woff) format("woff");font-weight:700;font-style:normal}`;
    document.head.appendChild(style);
  }

  function showToast() {
    loadXpFont();
    document.getElementById("update-notice-host")?.remove();

    // Shadow DOM keeps XP.css from restyling the rest of the site
    const host = document.createElement("div");
    host.id = "update-notice-host";
    Object.assign(host.style, {
      position: "fixed",
      right: "32px",
      bottom: "16px",
      zIndex: "99999",
      opacity: "0",
      transition: "opacity 0.4s",
    });
    const root = host.attachShadow({ mode: "open" });
    const el = (tag, props = {}, ...children) => {
      const node = Object.assign(document.createElement(tag), props);
      node.append(...children);
      return node;
    };

    const link = el("link", { rel: "stylesheet", href: "https://unpkg.com/xp.css" });
    const style = el(
      "style",
      {},
      `.window { width: 300px; }
.window-body { margin: 8px; font-family: "Pixelated MS Sans Serif", Arial, sans-serif; font-size: 11px; line-height: 1.25; }
.window-body p { margin: 0 0 8px; }
progress { width: 100%; }`
    );

    const closeButton = el("button");
    closeButton.setAttribute("aria-label", "Close");

    const progress = el("progress");
    progress.max = 100;
    progress.value = 0;

    const win = el(
      "div",
      { className: "window" },
      el(
        "div",
        { className: "title-bar" },
        el("div", { className: "title-bar-text" }, "Site Updated!"),
        el("div", { className: "title-bar-controls" }, closeButton)
      ),
      el(
        "div",
        { className: "window-body" },
        el(
          "p",
          {},
          "The site has been updated since your last visit!",
          el("br"),
          "Check the update diary and hard refresh if anything seems off."
        ),
        progress
      )
    );
    win.setAttribute("role", "status");
    root.append(link, style, win);

    const dismiss = () => {
      cancelAnimationFrame(frame);
      host.style.opacity = "0";
      setTimeout(() => host.remove(), 400);
    };
    closeButton.addEventListener("click", dismiss);

    // The bar fills from 0 to 100; hovering pauses it
    let elapsed = 0;
    let last = performance.now();
    let hovered = false;
    let frame;
    win.addEventListener("mouseenter", () => (hovered = true));
    win.addEventListener("mouseleave", () => (hovered = false));
    // XP.css draws chunks every 10px, so snap the value to whole chunks
    const CHUNK_PX = 10;
    const tick = (now) => {
      if (!hovered) elapsed += now - last;
      last = now;
      const contentPx = progress.clientWidth - 4;
      const frac = Math.min(1, elapsed / TOAST_MS);
      const chunks = Math.floor(frac * Math.ceil(contentPx / CHUNK_PX));
      progress.value = Math.min(100, ((chunks * CHUNK_PX) / contentPx) * 100);
      if (elapsed >= TOAST_MS) return dismiss();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    document.body.appendChild(host);
    requestAnimationFrame(() => (host.style.opacity = "1"));
  }

  // Console helpers: updateNoticeDebug.show() / .reset() / .check()
  window.updateNoticeDebug = {
    show: showToast,
    check: checkForUpdate,
    reset: () => localStorage.removeItem(STORAGE_KEY),
    // Pretend the visitor last saw an older version, then re-check
    simulateUpdate: () => {
      localStorage.setItem(STORAGE_KEY, "old-version");
      return checkForUpdate();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkForUpdate);
  } else {
    checkForUpdate();
  }
})();
