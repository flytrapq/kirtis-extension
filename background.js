/* Kirtis — фоновый скрипт.
   Здесь живёт всё, что ходит в сеть: у content-скрипта нет прав на кросс-доменный
   запрос, а у фонового они есть благодаря host_permissions. */

const api = typeof browser !== "undefined" ? browser : chrome;

const API_ORIGIN = "https://kirtis.info";
const API_PATH = "/api/krc/";
const ORIGIN_PATTERN = "https://kirtis.info/*";

const CACHE_PREFIX = "w:";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней
const CACHE_MAX_ENTRIES = 3000;
const REQUEST_TIMEOUT_MS = 12000;

/* Опознавательный User-Agent — по договорённости с UAB «Sistemium», чтобы они
   отличали трафик расширения в логах и могли написать напрямую.
   ВАЖНО: после публикации на AMO подставить сюда реальный адрес страницы. */
const CONTACT_URL = "https://github.com/flytrapq/kirtis-extension";
const USER_AGENT = `KirtisLookup-Firefox/${api.runtime.getManifest().version} (+${CONTACT_URL})`;

/* fetch() не даёт трогать User-Agent: он в списке forbidden header names и будет
   молча отброшен. Поэтому заголовок подменяется на уровне webRequest.
   Правим только собственные запросы: если пользователь просто открыл kirtis.info
   во вкладке, её запросы должны уходить с настоящим UA браузера, иначе мы
   испортим владельцам сайта их же статистику. */
const EXTENSION_ORIGIN = api.runtime.getURL("").replace(/\/$/, "");

if (api.webRequest && api.webRequest.onBeforeSendHeaders) {
  api.webRequest.onBeforeSendHeaders.addListener(
    details => {
      const ours =
        details.tabId === -1 &&
        (!details.originUrl || details.originUrl.startsWith(EXTENSION_ORIGIN));
      if (!ours) return {};

      const headers = (details.requestHeaders || [])
        .filter(h => h.name.toLowerCase() !== "user-agent");
      headers.push({ name: "User-Agent", value: USER_AGENT });
      return { requestHeaders: headers };
    },
    { urls: ["https://kirtis.info/api/*"] },
    ["blocking", "requestHeaders"]
  );
}

const DEFAULTS = {
  enabled: true,
  trigger: "button",        // button | auto
  uiLang: "en",             // en | ru | lt
  latinOnly: true,          // не предлагать кнопку для кириллицы и т.п.
  minLength: 2,
  buttonAnchor: "cursor",   // cursor | selection-start | selection-end
  offsetX: 6,
  offsetY: 6,
  useCache: true,
  disabledHosts: []
};

async function getSettings() {
  const stored = await api.storage.local.get("settings");
  return Object.assign({}, DEFAULTS, stored.settings || {});
}

/* ------------------------------------------------------------------ */
/* Кэш                                                                 */
/* ------------------------------------------------------------------ */

async function cacheGet(key) {
  const k = CACHE_PREFIX + key;
  const stored = await api.storage.local.get(k);
  const entry = stored[k];
  if (!entry) return null;
  if (Date.now() - entry.t > CACHE_TTL_MS) {
    await api.storage.local.remove(k);
    return null;
  }
  return entry;
}

async function cacheSet(key, payload) {
  const all = await api.storage.local.get(null);
  const keys = Object.keys(all).filter(k => k.startsWith(CACHE_PREFIX));
  if (keys.length >= CACHE_MAX_ENTRIES) {
    keys
      .sort((a, b) => (all[a].t || 0) - (all[b].t || 0))
      .slice(0, Math.ceil(CACHE_MAX_ENTRIES * 0.2))
      .forEach(k => api.storage.local.remove(k));
  }
  await api.storage.local.set({
    [CACHE_PREFIX + key]: Object.assign({ t: Date.now() }, payload)
  });
}

/* ------------------------------------------------------------------ */
/* Запрос к kirtis.info                                                */
/* ------------------------------------------------------------------ */

function normalize(raw) {
  // Сервер сам приводит слово к «Первая заглавная», но чистим ввод здесь.
  return (raw || "")
    .normalize("NFC")
    .replace(/[\s\u00A0]+/g, " ")
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "")
    .trim();
}

async function hasHostPermission() {
  if (!api.permissions || !api.permissions.contains) return true;
  try {
    return await api.permissions.contains({ origins: [ORIGIN_PATTERN] });
  } catch (e) {
    return true;
  }
}

async function lookup(rawWord, opts = {}) {
  const word = normalize(rawWord);

  if (!word) return { status: "invalid", word: rawWord };
  if (word.length > 30) return { status: "too-long", word };
  if (/\s/.test(word)) return { status: "multiword", word };

  const settings = await getSettings();
  const cacheKey = word.toLocaleLowerCase("lt");

  if (settings.useCache && !opts.noCache) {
    const hit = await cacheGet(cacheKey);
    if (hit) return { status: hit.status, word, items: hit.items || [], cached: true };
  }

  if (!(await hasHostPermission())) {
    return { status: "no-permission", word };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_ORIGIN + API_PATH + encodeURIComponent(word), {
      method: "GET",
      signal: controller.signal,
      credentials: "omit",
      headers: { Accept: "application/json" }
    });

    if (res.status === 404) {
      if (settings.useCache) await cacheSet(cacheKey, { status: "not-found", items: [] });
      return { status: "not-found", word };
    }
    if (res.status === 400) return { status: "invalid", word };
    if (!res.ok) return { status: "server-error", word, code: res.status };

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) {
      return { status: "not-found", word };
    }

    const clean = items.map(it => ({
      word: it.word,
      class: it.class || "",
      state: Array.isArray(it.state) ? it.state : []
    }));

    if (settings.useCache) await cacheSet(cacheKey, { status: "ok", items: clean });
    return { status: "ok", word, items: clean };
  } catch (e) {
    return {
      status: e.name === "AbortError" ? "timeout" : "network-error",
      word,
      detail: String(e && e.message || e)
    };
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Сообщения                                                           */
/* ------------------------------------------------------------------ */

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;

  if (msg.type === "lookup") {
    lookup(msg.word, { noCache: msg.noCache }).then(sendResponse);
    return true;
  }

  if (msg.type === "getSettings") {
    getSettings().then(sendResponse);
    return true;
  }

  if (msg.type === "openOptions") {
    api.runtime.openOptionsPage();
    return false;
  }

  if (msg.type === "clearCache") {
    api.storage.local.get(null).then(all => {
      const keys = Object.keys(all).filter(k => k.startsWith(CACHE_PREFIX));
      return api.storage.local.remove(keys).then(() => sendResponse({ removed: keys.length }));
    });
    return true;
  }
});

/* ------------------------------------------------------------------ */
/* Контекстное меню и горячая клавиша                                  */
/* ------------------------------------------------------------------ */

async function buildMenu() {
  const settings = await getSettings();
  const T = kirtisStrings(settings.uiLang);
  api.contextMenus.removeAll(() => {
    api.contextMenus.create({
      id: "kirtis-lookup",
      title: T.ctxLookup,
      contexts: ["selection"]
    });
  });
}

api.runtime.onInstalled.addListener(buildMenu);
if (api.runtime.onStartup) api.runtime.onStartup.addListener(buildMenu);

// Язык интерфейса сменили — переписываем пункт меню.
api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) buildMenu();
});

api.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "kirtis-lookup" || !tab) return;
  api.tabs.sendMessage(tab.id, { type: "showFor", word: info.selectionText })
    .catch(() => {});
});

if (api.commands && api.commands.onCommand) {
  api.commands.onCommand.addListener(async command => {
    if (command !== "lookup-selection") return;
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    if (tab) api.tabs.sendMessage(tab.id, { type: "showForSelection" }).catch(() => {});
  });
}
