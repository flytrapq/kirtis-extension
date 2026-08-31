const api = typeof browser !== "undefined" ? browser : chrome;
const ORIGIN_PATTERN = "https://kirtis.info/*";

const DEFAULTS = {
  enabled: true,
  trigger: "button",
  uiLang: "en",
  latinOnly: true,
  minLength: 2,
  buttonAnchor: "cursor",
  offsetX: 6,
  offsetY: 6,
  useCache: true,
  disabledHosts: []
};

const $ = id => document.getElementById(id);
let T = kirtisStrings(DEFAULTS.uiLang);

/* --- перевод разметки ------------------------------------------------ */

function setText(el, text) {
  // У части подписей внутри лежит вложенная подсказка — её нельзя затирать.
  const hint = el.querySelector(":scope > .hint");
  if (hint) {
    Array.from(el.childNodes).forEach(n => { if (n.nodeType === 3) n.remove(); });
    el.insertBefore(document.createTextNode(text), hint);
  } else {
    el.textContent = text;
  }
}

function applyI18n() {
  T = kirtisStrings($("uiLang").value);
  document.documentElement.lang = $("uiLang").value;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const value = T[el.dataset.i18n];
    if (typeof value === "string") setText(el, value);
  });
  refreshPermState();
}

function fillLangs(current) {
  const sel = $("uiLang");
  sel.replaceChildren();
  KIRTIS_LANGS.forEach(code => {
    const o = document.createElement("option");
    o.value = code;
    o.textContent = KIRTIS_I18N[code].langName;
    sel.appendChild(o);
  });
  sel.value = current;
}

/* --- настройки -------------------------------------------------------- */

function readForm() {
  const num = (id, fallback) => {
    const v = parseInt($(id).value, 10);
    return Number.isFinite(v) ? Math.max(-200, Math.min(200, v)) : fallback;
  };
  return {
    enabled: $("enabled").checked,
    trigger: $("trigger").value,
    uiLang: $("uiLang").value,
    latinOnly: $("latinOnly").checked,
    minLength: parseInt($("minLength").value, 10) || 2,
    buttonAnchor: $("buttonAnchor").value,
    offsetX: num("offsetX", 6),
    offsetY: num("offsetY", 6),
    useCache: $("useCache").checked,
    disabledHosts: $("disabledHosts").value
      .split("\n")
      .map(s => s.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
      .filter(Boolean)
  };
}

function fillForm(s) {
  $("enabled").checked = s.enabled;
  $("trigger").value = s.trigger;
  fillLangs(s.uiLang);
  $("latinOnly").checked = s.latinOnly;
  $("minLength").value = String(s.minLength);
  $("buttonAnchor").value = s.buttonAnchor;
  $("offsetX").value = String(s.offsetX);
  $("offsetY").value = String(s.offsetY);
  $("useCache").checked = s.useCache;
  $("disabledHosts").value = (s.disabledHosts || []).join("\n");
}

async function save() {
  await api.storage.local.set({ settings: readForm() });
  const el = $("saved");
  el.textContent = T.saved;
  el.className = "status ok";
  setTimeout(() => { el.textContent = ""; el.className = "status"; }, 1200);
}

async function refreshPermState() {
  const el = $("permState");
  try {
    const granted = await api.permissions.contains({ origins: [ORIGIN_PATTERN] });
    el.textContent = granted ? T.permGranted : T.permMissing;
    el.className = "status " + (granted ? "ok" : "err");
    $("grant").disabled = granted;
  } catch (e) {
    el.textContent = "";
  }
}

/* --- запуск ----------------------------------------------------------- */

(async function init() {
  const stored = await api.storage.local.get("settings");
  fillForm(Object.assign({}, DEFAULTS, stored.settings || {}));
  applyI18n();

  ["enabled", "trigger", "latinOnly", "minLength", "buttonAnchor",
   "offsetX", "offsetY", "useCache", "disabledHosts"]
    .forEach(id => $(id).addEventListener("change", save));

  $("uiLang").addEventListener("change", () => { applyI18n(); save(); });

  $("grant").addEventListener("click", async () => {
    try {
      await api.permissions.request({ origins: [ORIGIN_PATTERN] });
    } catch (e) { /* пользователь отказался */ }
    refreshPermState();
  });

  $("clear").addEventListener("click", () => {
    api.runtime.sendMessage({ type: "clearCache" }).then(res => {
      const el = $("cacheState");
      el.textContent = T.cacheCleared(res ? res.removed : 0);
      el.className = "status ok";
    });
  });
})();
