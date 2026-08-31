# Kirtis — Lithuanian word stress, inline

Select a Lithuanian word on any page, a small button appears next to it, and one
click brings up the stressed spelling along with the part of speech and grammatical
tags. Same interaction as Simple Translate, but instead of a translation you get
the accentuation, sourced from [kirtis.info](https://kirtis.info).

Lithuanian stress is not predictable from spelling, and it shifts between forms of
the same word. Looking it up normally means opening a separate tab and retyping the
word with its diacritics — this removes that step.

## Install

From Firefox Add-ons: https://addons.mozilla.org/en-US/firefox/addon/kirtis-žodžių-kirčiavimas/

Requires Firefox 140 or newer (Firefox for Android 142 or newer).

### Running it from source

1. Open `about:debugging#/runtime/this-firefox`
2. *Load Temporary Add-on…* → pick `manifest.json` from this folder
3. The add-on stays until you restart Firefox

If lookups fail with a permission message, open the add-on's settings and use
*Grant access to kirtis.info*. Firefox does not always grant host permissions for
MV3 extensions automatically.

## What it does

- Floating button on selection, or the result straight away — your choice
- Identical spellings are merged: `virtuve` returns four grammatical forms from the
  server but only two distinct stress patterns, so you see two blocks rather than
  four rows
- Every grammatical abbreviation has a tooltip with the full term
- Interface in English, Lithuanian and Russian, independent of your browser locale
- Right-click menu entry and an <kbd>Alt</kbd>+<kbd>K</kbd> shortcut
- Toolbar popup for typing a word directly

### Settings

- On/off, and a list of excluded domains
- Button on selection, or show the result immediately
- Interface language: English / lietuvių / русский
- Latin script only, so the button stays out of the way in other alphabets
- Minimum word length (2–4 letters)
- Button position: at the cursor, above the start of the word, or after its end,
  plus X/Y offsets
- Local cache, 30 days, with a button to clear it

### If the button collides with another extension

Simple Translate and similar add-ons place their button at the cursor too, so the
two overlap. Under *Button position*, **Above the start of the word** moves ours up
and leaves the cursor to the other one; that is usually enough. **After the end of
the word** and the manual X/Y offsets cover the rest.

## Privacy

The word you select is sent to kirtis.info to be looked up. Nothing else leaves
your browser: no analytics, no telemetry, no third-party scripts, no account.
Answers are cached locally for 30 days, so repeating a word costs no request at
all. The cache and your settings live in browser storage and you can wipe them
from the settings page.

## Permission from the service owners

UAB Sistemium, who run kirtis.info, confirmed by email that they are fine with this
extension using their API and with it being published on addons.mozilla.org. They
set no rate limits, and said they would get in touch rather than block anything if
traffic ever looked unusual.

At their request every request carries an identifying User-Agent so they can tell
this traffic apart in their logs:

```
KirtisLookup-Firefox/{version} (+{contact URL})
```

It is defined in `background.js` as `CONTACT_URL` and `USER_AGENT`.

`fetch()` cannot set it — `User-Agent` is a forbidden header name and is dropped
silently — so it is applied through `webRequest.onBeforeSendHeaders`, which is why
the manifest asks for `webRequest` and `webRequestBlocking`. The listener only
touches the extension's own requests, checked via `tabId === -1` and the extension
`originUrl`. Requests from kirtis.info open in a normal tab keep the real browser
User-Agent — otherwise this would corrupt the owners' own statistics.

## The API

kirtis.info has no documented public API, but the client and server are open source
in [Sistemium/krc-angular](https://github.com/Sistemium/krc-angular) (GPL-2.0), and
`server/routes.js` lays out the service:

| Endpoint | Purpose |
|---|---|
| `GET /api/krc/{word}` | accentuation; `200` with a JSON array, `404` if unknown, `400` with no word |
| `GET /api/zodynas/{prefix}` | autocomplete, array of strings (unused here) |
| `GET /api/strp/` | grammatical abbreviation glossary |

A response from `/api/krc/`:

```json
[
  { "word": "virtùvė", "class": "dktv.", "state": ["mot.gim.", "vnsk.", "V."] }
]
```

One entry per grammatical form, so the same spelling can appear several times. The
server capitalises the word itself, queries `donelaitis.vdu.lt` and caches in Redis.
No key or token is involved. Its own web client sends a `deviceUUID` header for
statistics; this extension does not.

The abbreviation glossary (`data/abbr.js`) comes from `server/api/strp/strp.json`
and is bundled statically rather than fetched. English and Russian glosses were
added alongside the Lithuanian ones.

## Layout

```
manifest.json        MV3, Gecko flavoured
background.js        the only code that touches the network; cache, context menu, Alt+K
content/content.js   selection tracking, button and panel inside a closed shadow DOM
data/i18n.js         interface strings: EN / LT / RU
data/abbr.js         abbreviations → full terms (LT + EN + RU)
pages/options.*      settings and the host permission request
pages/popup.*        manual lookup from the toolbar
tools/make-icons.py  regenerates the PNG icons
```

Cross-origin requests go through the background script: content scripts have no
permission for them, and `/api/krc/` sends no CORS headers, so a request from the
page itself would never complete.

Interface language comes from the settings rather than the browser locale, since
people reading Lithuanian text may run Firefox in any language. To add a language,
append a block to `KIRTIS_I18N` and its code to `KIRTIS_LANGS` in `data/i18n.js`.

## Limitations

- One word at a time; that is how the service works
- Exact spelling only. `virtuvėje` resolves, a typo returns `404`
- Top-level documents only, not iframes. Drop `"all_frames": false` in the manifest
  if you need selections inside embedded frames
- Stress arrives as a finished string with diacritics; the extension does not split
  it into syllables or highlight the stressed vowel separately

## Licence and credits

GPL-2.0, see [`LICENSE`](LICENSE). The API layout and the abbreviation glossary
(`data/abbr.js` ← `server/api/strp/strp.json`) come from
[Sistemium/krc-angular](https://github.com/Sistemium/krc-angular) under the same
licence.

Accentuation data belongs to kirtis.info, credited in the result panel and the
popup. It is a free, non-commercial service: if you fork this, please keep the
cache and do not add a request per mouse movement.
