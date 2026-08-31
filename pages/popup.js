const api = typeof browser !== "undefined" ? browser : chrome;

const out = document.getElementById("out");
let uiLang = "en";
let T = kirtisStrings(uiLang);

const STATUS_KEY = {
  "not-found": "notFound",
  "invalid": "invalid",
  "multiword": "multiword",
  "too-long": "tooLong",
  "server-error": "serverError",
  "timeout": "timeout",
  "network-error": "networkError",
  "no-permission": "noPermission"
};

function applyI18n() {
  document.documentElement.lang = uiLang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const v = T[el.dataset.i18n];
    if (typeof v === "string") el.textContent = v;
  });
  document.getElementById("q").placeholder = T.popupPlaceholder;
}

api.runtime.sendMessage({ type: "getSettings" })
  .then(s => {
    if (s && s.uiLang) uiLang = s.uiLang;
    T = kirtisStrings(uiLang);
    applyI18n();
  })
  .catch(applyI18n);

function abbrTitle(code) {
  const rec = KIRTIS_ABBR[code];
  if (!rec) return code;
  if (uiLang === "lt") return rec.lt;
  const own = rec[uiLang];
  return own ? `${own} · ${rec.lt}` : rec.lt;
}

function properCase(item) {
  const w = item.word || "";
  return (item.state || []).includes("T.")
    ? w.charAt(0).toLocaleUpperCase("lt") + w.slice(1)
    : w.toLocaleLowerCase("lt");
}

/* Одно написание — один блок, под ним наборы помет (как в панели на странице). */
function groupItems(items) {
  const order = [];
  const byKey = new Map();
  items.forEach(item => {
    const display = properCase(item);
    const key = display + "|" + (item.class || "");
    let g = byKey.get(key);
    if (!g) {
      g = { display, class: item.class || "", states: [], seen: new Set() };
      byKey.set(key, g);
      order.push(g);
    }
    const sig = (item.state || []).join(",");
    if (!g.seen.has(sig)) {
      g.seen.add(sig);
      g.states.push(item.state || []);
    }
  });
  return order;
}

function render(res) {
  out.replaceChildren();
  if (!res) return;

  if (res.status !== "ok") {
    const d = document.createElement("div");
    d.className = "msg" + (res.status === "not-found" ? "" : " err");
    d.textContent = T[STATUS_KEY[res.status]] || T.popupError;
    out.appendChild(d);
    return;
  }

  groupItems(res.items).forEach(group => {
    const entry = document.createElement("div");
    entry.className = "entry";

    const w = document.createElement("span");
    w.className = "word";
    w.textContent = group.display;
    entry.appendChild(w);

    if (group.class) {
      const p = document.createElement("span");
      p.className = "pos";
      p.textContent = group.class;
      p.title = abbrTitle(group.class);
      entry.appendChild(p);
    }

    group.states.forEach(state => {
      if (!state.length) return;
      const tags = document.createElement("div");
      tags.className = "tags";
      state.forEach(code => {
        const t = document.createElement("span");
        t.className = "tag";
        t.textContent = code;
        t.title = abbrTitle(code);
        tags.appendChild(t);
      });
      entry.appendChild(tags);
    });

    out.appendChild(entry);
  });
}

function run() {
  const word = document.getElementById("q").value.trim();
  if (!word) return;
  out.textContent = T.loading;
  api.runtime.sendMessage({ type: "lookup", word })
    .then(render)
    .catch(() => render({ status: "network-error" }));
}

document.getElementById("go").addEventListener("click", run);
document.getElementById("q").addEventListener("keydown", e => {
  if (e.key === "Enter") run();
});
document.getElementById("opts").addEventListener("click", () => {
  api.runtime.openOptionsPage();
  window.close();
});
