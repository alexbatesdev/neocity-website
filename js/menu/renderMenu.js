// Loads menu.html (the single source for all menus) into a shadow root on `target`.
const MENU_URL = new URL("./menu.html", import.meta.url);
let menuHtml = null;

const loadMenuHtml = () => (menuHtml ??= fetch(MENU_URL).then((r) => {
  if (!r.ok) throw new Error(`Failed to load menu: ${r.status}`);
  return r.text();
}));

// mode: "document" | "space" | "nekkoplat". onAction(name) fires for clicks on [data-action] elements.
export async function renderMenu(target, { mode, onAction = () => {} }) {
  const html = await loadMenuHtml();
  const root = target.shadowRoot ?? target.attachShadow({ mode: "open" });
  target.dataset.menuMode = mode;

  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const content = tpl.content;

  for (const el of content.querySelectorAll("[data-modes]")) {
    if (!el.dataset.modes.split(/\s+/).includes(mode)) el.remove();
  }

  // Scripts parsed from a template never run; recreate them so they do.
  for (const old of content.querySelectorAll("script")) {
    const script = document.createElement("script");
    for (const attr of old.attributes) script.setAttribute(attr.name, attr.value);
    script.textContent = old.textContent;
    old.replaceWith(script);
  }

  root.replaceChildren(content);
  root.addEventListener("click", (e) => {
    const el = e.target.closest?.("[data-action]");
    if (el) onAction(el.dataset.action);
  });
}
