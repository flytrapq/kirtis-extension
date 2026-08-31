/* Kirtis — content-скрипт.
   Показывает кнопку рядом с выделенным словом и панель с результатом.
   Вся вёрстка живёт в closed shadow root, поэтому стили страницы её не трогают. */

(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  if (window.__kirtisLoaded) return;
  window.__kirtisLoaded = true;

  /* ---------------------------------------------------------------- */
  /* Строки и настройки                                                */
  /* ---------------------------------------------------------------- */

  let settings = {
    enabled: true,
    trigger: "button",
    uiLang: "en",
    latinOnly: true,
    minLength: 2,
    buttonAnchor: "cursor",
    offsetX: 6,
    offsetY: 6,
    disabledHosts: []
  };
  let T = kirtisStrings(settings.uiLang);

  api.runtime.sendMessage({ type: "getSettings" }).then(s => {
    if (s) {
      settings = Object.assign(settings, s);
      T = kirtisStrings(settings.uiLang);
    }
  }).catch(() => {});

  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.settings) {
      settings = Object.assign(settings, changes.settings.newValue || {});
      T = kirtisStrings(settings.uiLang);
      hideAll();
    }
  });

  /* ---------------------------------------------------------------- */
  /* Разметка и стили                                                  */
  /* ---------------------------------------------------------------- */

  const CSS = `
:host { all: initial; }
* { box-sizing: border-box; }

.btn, .panel {
  position: fixed;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #F5F2EA;
}

.btn {
  width: 28px; height: 28px;
  border: 0; padding: 0; margin: 0;
  border-radius: 8px;
  background: #17223B;
  box-shadow: 0 2px 10px rgba(15, 20, 40, .35);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(.85);
  animation: pop .12s ease-out forwards;
}
.btn:hover { background: #24325A; }
.btn:focus-visible { outline: 2px solid #E8A33D; outline-offset: 2px; }
.btn svg { display: block; }

@keyframes pop { to { opacity: 1; transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .btn { animation: none; opacity: 1; transform: none; }
}

.panel {
  width: 320px; max-width: calc(100vw - 20px);
  max-height: min(60vh, 460px);
  overflow: auto;
  background: #17223B;
  border: 1px solid #2A3760;
  border-radius: 12px;
  box-shadow: 0 12px 34px rgba(9, 13, 28, .45);
  padding: 12px 14px 10px;
  font-size: 13px; line-height: 1.45;
  overscroll-behavior: contain;
}

.head {
  display: flex; align-items: baseline; gap: 8px;
  padding-bottom: 8px; margin-bottom: 8px;
  border-bottom: 1px solid #2A3760;
}
.query { font-size: 12px; color: #8A93AD; letter-spacing: .02em; }
.close {
  margin-left: auto; background: none; border: 0; cursor: pointer;
  color: #8A93AD; font-size: 16px; line-height: 1; padding: 2px 4px;
}
.close:hover { color: #F5F2EA; }

.entry { padding: 7px 0; border-top: 1px solid rgba(42, 55, 96, .55); }
.entry:first-of-type { border-top: 0; padding-top: 0; }

.word {
  font-family: Georgia, "Iowan Old Style", "Times New Roman", serif;
  font-size: 21px; font-weight: 600; letter-spacing: .01em;
  color: #FFF7E8;
  cursor: copy;
  word-break: break-word;
}
.word:hover { color: #E8A33D; }

.pos {
  font-family: Georgia, serif; font-style: italic;
  font-size: 13px; color: #E8A33D; margin-left: 6px;
  border-bottom: 1px dotted rgba(232, 163, 61, .5); cursor: help;
}

.tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.tag {
  font-size: 11px; padding: 2px 7px; border-radius: 999px;
  background: rgba(138, 147, 173, .16); color: #C3CADF;
  cursor: help; white-space: nowrap;
}
.tag:hover { background: rgba(232, 163, 61, .18); color: #F5DFB8; }

.msg { color: #C3CADF; padding: 4px 0 6px; }
.msg.err { color: #F0B4A8; }

.foot {
  display: flex; align-items: center; gap: 10px;
  margin-top: 10px; padding-top: 8px;
  border-top: 1px solid #2A3760;
  font-size: 11px; color: #6F7896;
}
.foot a, .foot button {
  color: #8A93AD; background: none; border: 0; padding: 0;
  font: inherit; cursor: pointer; text-decoration: none;
}
.foot a:hover, .foot button:hover { color: #E8A33D; }
.spacer { margin-left: auto; }

.spinner {
  width: 13px; height: 13px; border-radius: 50%;
  border: 2px solid rgba(232, 163, 61, .25); border-top-color: #E8A33D;
  display: inline-block; vertical-align: -2px; margin-right: 6px;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; } }
`;

  /* Иконку собираем через DOM, а не через innerHTML: строка здесь статическая и
     безопасная, но линтер AMO ругается на любое присваивание innerHTML, а спорить
     с ним дороже, чем написать пять вызовов createElementNS. */
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgNode(tag, attrs, text) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text != null) node.textContent = text;
    return node;
  }

  function buildIcon() {
    const svg = svgNode("svg", {
      width: "18", height: "18", viewBox: "0 0 96 96", "aria-hidden": "true"
    });
    svg.appendChild(svgNode("text", {
      x: "48", y: "72", "text-anchor": "middle",
      "font-family": "Georgia, serif", "font-size": "66", fill: "#F5F2EA"
    }, "a"));
    svg.appendChild(svgNode("path", {
      d: "M24 27 q7 -9 14 -3 t14 -3", stroke: "#E8A33D",
      "stroke-width": "8", fill: "none", "stroke-linecap": "round"
    }));
    return svg;
  }

  let host, root, btnEl, panelEl;
  let anchorRange = null;      // Range выделения, чтобы пересчитывать позицию
  let anchorPoint = null;      // координаты курсора на момент выделения
  let currentWord = "";

  function ensureRoot() {
    if (host && host.isConnected) return;
    host = document.createElement("div");
    host.setAttribute("data-kirtis", "");
    host.style.cssText = "all:initial;position:static;";
    root = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = CSS;
    root.appendChild(style);
    document.documentElement.appendChild(host);
  }

  /* ---------------------------------------------------------------- */
  /* Позиционирование                                                  */
  /* ---------------------------------------------------------------- */

  function anchorRect() {
    if (anchorRange) {
      const r = anchorRange.getBoundingClientRect();
      if (r && (r.width || r.height)) return r;
    }
    if (anchorPoint) {
      return { left: anchorPoint.x, right: anchorPoint.x, top: anchorPoint.y, bottom: anchorPoint.y, width: 0, height: 0 };
    }
    return null;
  }

  function inViewport(rect) {
    const vh = document.documentElement.clientHeight;
    return !(rect.bottom < -40 || rect.top > vh + 40);
  }

  function clamp(el, left, top) {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const w = el.offsetWidth || 28;
    const h = el.offsetHeight || 28;
    el.style.left = Math.round(Math.max(8, Math.min(left, vw - w - 8))) + "px";
    el.style.top = Math.round(Math.max(8, Math.min(top, vh - h - 8))) + "px";
  }

  /* Кнопка. Точка привязки настраивается: у курсора её любят и другие
     расширения, поэтому есть варианты «над началом» и «после конца» слова. */
  function placeButton(el) {
    const rect = anchorRect();
    if (!rect || !inViewport(rect)) return false;

    const size = el.offsetHeight || 28;
    const dx = Number(settings.offsetX) || 0;
    const dy = Number(settings.offsetY) || 0;

    let left, top;
    switch (settings.buttonAnchor) {
      case "selection-start":
        left = rect.left;
        top = rect.top - size - 4;
        break;
      case "selection-end":
        left = rect.right + 4;
        top = rect.bottom + 4;
        break;
      default: // cursor
        left = anchorPoint ? anchorPoint.x : rect.left;
        top = anchorPoint ? anchorPoint.y : rect.bottom;
    }

    clamp(el, left + dx, top + dy);
    return true;
  }

  function placePanel(el) {
    const rect = anchorRect();
    if (!rect || !inViewport(rect)) return false;

    const vh = document.documentElement.clientHeight;
    const h = el.offsetHeight || 80;
    const gap = 10;

    const left = anchorPoint ? anchorPoint.x + 6 : rect.left;
    let top = rect.bottom + gap;
    if (top + h > vh - 8) {
      const above = rect.top - h - gap;
      top = above > 8 ? above : vh - h - 8;
    }

    clamp(el, left, top);
    return true;
  }

  function reposition() {
    if (btnEl && btnEl.isConnected && !placeButton(btnEl)) hideButton();
    if (panelEl && panelEl.isConnected && !placePanel(panelEl)) hidePanel();
  }

  /* ---------------------------------------------------------------- */
  /* Кнопка                                                            */
  /* ---------------------------------------------------------------- */

  function showButton() {
    ensureRoot();
    hideButton();
    btnEl = document.createElement("button");
    btnEl.className = "btn";
    btnEl.type = "button";
    btnEl.title = T.btnTitle;
    btnEl.setAttribute("aria-label", T.btnTitle);
    btnEl.appendChild(buildIcon());
    btnEl.addEventListener("mousedown", e => { e.preventDefault(); e.stopPropagation(); });
    btnEl.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      hideButton();
      openPanel(currentWord);
    });
    root.appendChild(btnEl);
    if (!placeButton(btnEl)) hideButton();
  }

  function hideButton() {
    if (btnEl) { btnEl.remove(); btnEl = null; }
  }

  /* ---------------------------------------------------------------- */
  /* Панель                                                            */
  /* ---------------------------------------------------------------- */

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function abbrTitle(code) {
    const rec = KIRTIS_ABBR[code];
    if (!rec) return code;
    // Литовский термин показываем всегда: он же напечатан на самой пометке.
    if (settings.uiLang === "lt") return rec.lt;
    const own = rec[settings.uiLang];
    return own ? `${own} · ${rec.lt}` : rec.lt;
  }

  function properCase(item) {
    const w = item.word || "";
    if ((item.state || []).indexOf("T.") >= 0) {
      return w.charAt(0).toLocaleUpperCase("lt") + w.slice(1);
    }
    return w.toLocaleLowerCase("lt");
  }

  /* Сервер отдаёт по строке на каждую грамматическую форму, поэтому одно и то же
     написание приходит несколько раз. Схлопываем: одно написание — один блок,
     под ним несколько наборов помет. */
  function groupItems(items) {
    const order = [];
    const byKey = new Map();

    items.forEach(item => {
      const display = properCase(item);
      const key = display + "|" + (item.class || "");
      let group = byKey.get(key);
      if (!group) {
        group = { display, class: item.class || "", states: [], seen: new Set() };
        byKey.set(key, group);
        order.push(group);
      }
      const sig = (item.state || []).join(",");
      if (!group.seen.has(sig)) {
        group.seen.add(sig);
        group.states.push(item.state || []);
      }
    });

    return order;
  }

  function openPanel(word) {
    ensureRoot();
    hidePanel();
    currentWord = word;

    panelEl = el("div", "panel");
    panelEl.setAttribute("role", "dialog");
    panelEl.addEventListener("mousedown", e => e.stopPropagation());

    renderLoading(word);
    root.appendChild(panelEl);
    placePanel(panelEl);

    api.runtime.sendMessage({ type: "lookup", word })
      .then(res => { if (panelEl) renderResult(res); })
      .catch(() => { if (panelEl) renderMessage(T.networkError, true); });
  }

  function hidePanel() {
    if (panelEl) { panelEl.remove(); panelEl = null; }
  }

  function hideAll() { hideButton(); hidePanel(); }

  function header(word) {
    const h = el("div", "head");
    h.appendChild(el("span", "query", word));
    const close = el("button", "close", "×");
    close.title = "Esc";
    close.addEventListener("click", hidePanel);
    h.appendChild(close);
    return h;
  }

  function footer(word, extraNote) {
    const f = el("div", "foot");
    const link = el("a", null, "kirtis.info");
    link.href = "https://kirtis.info/#/krc";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    f.appendChild(link);
    if (extraNote) f.appendChild(el("span", null, "· " + extraNote));

    const retry = el("button", "spacer", T.retry);
    retry.addEventListener("click", () => {
      renderLoading(word);
      api.runtime.sendMessage({ type: "lookup", word, noCache: true })
        .then(res => { if (panelEl) renderResult(res); })
        .catch(() => { if (panelEl) renderMessage(T.networkError, true); });
    });
    f.appendChild(retry);
    return f;
  }

  function renderLoading(word) {
    panelEl.replaceChildren();
    panelEl.appendChild(header(word));
    const m = el("div", "msg");
    m.appendChild(el("span", "spinner"));
    m.appendChild(document.createTextNode(T.loading));
    panelEl.appendChild(m);
  }

  function renderMessage(text, isError, word, withSettings) {
    panelEl.replaceChildren();
    panelEl.appendChild(header(word || currentWord));
    panelEl.appendChild(el("div", "msg" + (isError ? " err" : ""), text));
    const f = footer(word || currentWord);
    if (withSettings) {
      const s = el("button", null, T.openSettings);
      s.addEventListener("click", () => api.runtime.sendMessage({ type: "openOptions" }));
      f.insertBefore(s, f.querySelector(".spacer"));
    }
    panelEl.appendChild(f);
    placePanel(panelEl);
  }

  function renderResult(res) {
    if (!res) return renderMessage(T.networkError, true);

    switch (res.status) {
      case "not-found":   return renderMessage(T.notFound, false, res.word);
      case "invalid":     return renderMessage(T.invalid, true, res.word);
      case "multiword":   return renderMessage(T.multiword, true, res.word);
      case "too-long":    return renderMessage(T.tooLong, true, res.word);
      case "server-error":return renderMessage(T.serverError, true, res.word);
      case "timeout":     return renderMessage(T.timeout, true, res.word);
      case "network-error":return renderMessage(T.networkError, true, res.word);
      case "no-permission":return renderMessage(T.noPermission, true, res.word, true);
    }

    panelEl.replaceChildren();
    panelEl.appendChild(header(res.word));

    groupItems(res.items).forEach(group => {
      const entry = el("div", "entry");

      const w = el("span", "word", group.display);
      w.title = T.copy;
      w.addEventListener("click", () => {
        navigator.clipboard.writeText(group.display).then(() => {
          const old = w.textContent;
          w.textContent = T.copied;
          setTimeout(() => { w.textContent = old; }, 700);
        }).catch(() => {});
      });
      entry.appendChild(w);

      if (group.class) {
        const pos = el("span", "pos", group.class);
        pos.title = abbrTitle(group.class);
        entry.appendChild(pos);
      }

      group.states.forEach(state => {
        if (!state.length) return;
        const tags = el("div", "tags");
        state.forEach(code => {
          const tag = el("span", "tag", code);
          tag.title = abbrTitle(code);
          tags.appendChild(tag);
        });
        entry.appendChild(tags);
      });

      panelEl.appendChild(entry);
    });

    const note = [];
    if (res.items.length > 1) note.push(T.formsCount(res.items.length));
    if (res.cached) note.push(T.cached);
    panelEl.appendChild(footer(res.word, note.join(" · ")));
    placePanel(panelEl);
  }

  /* ---------------------------------------------------------------- */
  /* Разбор выделения                                                  */
  /* ---------------------------------------------------------------- */

  const LATIN_WORD = /^[\p{Script=Latin}'\u2019-]+$/u;
  const ANY_WORD = /^[\p{L}'\u2019-]+$/u;

  function selectedWord() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;

    const raw = sel.toString().normalize("NFC")
      .replace(/[\u00AD\u200B]/g, "")
      .trim()
      .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");

    if (!raw) return null;
    if (raw.length < (settings.minLength || 2) || raw.length > 30) return null;
    if (/\s/.test(raw)) return null;

    const re = settings.latinOnly ? LATIN_WORD : ANY_WORD;
    if (!re.test(raw)) return null;

    return { word: raw, range: sel.getRangeAt(0).cloneRange() };
  }

  function siteDisabled() {
    return (settings.disabledHosts || []).includes(location.hostname);
  }

  function handleSelection(ev) {
    if (!settings.enabled || siteDisabled()) return;
    const hit = selectedWord();
    if (!hit) { hideButton(); return; }

    currentWord = hit.word;
    anchorRange = hit.range;
    anchorPoint = ev && ev.clientX != null ? { x: ev.clientX, y: ev.clientY } : null;

    if (settings.trigger === "auto") {
      hideButton();
      openPanel(hit.word);
    } else {
      showButton();
    }
  }

  /* ---------------------------------------------------------------- */
  /* События                                                           */
  /* ---------------------------------------------------------------- */

  document.addEventListener("mouseup", ev => {
    if (host && host.contains(ev.target)) return;
    setTimeout(() => handleSelection(ev), 0);
  }, true);

  document.addEventListener("keyup", ev => {
    if (!ev.shiftKey && !["ArrowLeft", "ArrowRight", "Home", "End"].includes(ev.key)) return;
    setTimeout(() => handleSelection(null), 0);
  }, true);

  document.addEventListener("mousedown", ev => {
    if (host && host.contains(ev.target)) return;
    hideAll();
  }, true);

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape") hideAll();
  }, true);

  window.addEventListener("scroll", reposition, true);
  window.addEventListener("resize", reposition, true);

  api.runtime.onMessage.addListener(msg => {
    if (!msg) return;
    if (msg.type === "showFor" && msg.word) {
      const sel = window.getSelection();
      anchorRange = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      anchorPoint = null;
      openPanel(msg.word.trim());
    }
    if (msg.type === "showForSelection") {
      const hit = selectedWord();
      if (hit) {
        anchorRange = hit.range;
        anchorPoint = null;
        openPanel(hit.word);
      }
    }
  });
})();
