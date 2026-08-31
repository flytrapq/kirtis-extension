/* Kirtis — строки интерфейса. Язык выбирается в настройках, а не берётся из
   локали браузера: расширение читают литовский текст люди, у которых Firefox
   может быть на каком угодно языке. */

var KIRTIS_I18N = {

  ru: {
    langName: "Русский",

    // Панель результата
    btnTitle: "Показать ударение",
    loading: "Запрашиваем…",
    notFound: "Слово не найдено в базе kirtis.info",
    invalid: "Не похоже на отдельное слово",
    multiword: "Получить ударение можно только у одного слова за раз",
    tooLong: "Слишком длинное слово (больше 30 букв)",
    serverError: "Сервер kirtis.info ответил ошибкой",
    networkError: "Не удалось связаться с kirtis.info",
    timeout: "Сервер не ответил вовремя",
    noPermission: "Нет доступа к kirtis.info. Откройте настройки расширения и выдайте разрешение.",
    openSettings: "Настройки",
    retry: "Повторить",
    copy: "Копировать",
    copied: "Скопировано",
    cached: "из кэша",
    formsCount: n => {
      const d = n % 10, h = n % 100;
      const w = d === 1 && h !== 11 ? "форма"
        : d >= 2 && d <= 4 && (h < 10 || h >= 20) ? "формы" : "форм";
      return `${n} ${w}`;
    },

    // Контекстное меню
    ctxLookup: "Показать ударение: «%s»",

    // Попап
    popupPlaceholder: "Литовское слово",
    popupGo: "Показать ударение",
    popupSettings: "Настройки",
    popupError: "Ошибка",

    // Настройки
    optSubtitle: "Ударения литовских слов из базы kirtis.info",
    secAccess: "Доступ",
    grantBtn: "Разрешить доступ к kirtis.info",
    permGranted: "доступ есть",
    permMissing: "доступ не выдан",

    secBehavior: "Поведение",
    lblEnabled: "Включено",
    hintEnabled: "Реагировать на выделение текста на страницах",
    lblTrigger: "При выделении слова",
    trgButton: "Показывать кнопку",
    trgAuto: "Сразу показывать ударение",
    lblLang: "Язык интерфейса",
    lblLatinOnly: "Только латиница",
    hintLatinOnly: "Не предлагать кнопку для кириллицы, иероглифов и т. п.",
    lblMinLength: "Минимальная длина слова, букв",

    secPlacement: "Положение кнопки",
    lblAnchor: "Появляться",
    anchorCursor: "У курсора",
    anchorStart: "Над началом слова",
    anchorEnd: "После конца слова",
    lblOffsetX: "Сдвиг по горизонтали, px",
    lblOffsetY: "Сдвиг по вертикали, px",
    hintPlacement: "Если кнопка налезает на кнопку другого расширения (например, Simple Translate), смените точку привязки или задайте сдвиг.",

    secSites: "Сайты-исключения",
    lblDisabledHosts: "По одному домену в строке",

    secCache: "Кэш",
    lblUseCache: "Хранить ответы локально",
    hintUseCache: "Меньше запросов к kirtis.info, срок хранения — 30 дней",
    clearBtn: "Очистить кэш",
    cacheCleared: n => `удалено записей: ${n}`,
    saved: "Сохранено"
  },

  en: {
    langName: "English",

    btnTitle: "Show stress",
    loading: "Looking up…",
    notFound: "Not found in the kirtis.info database",
    invalid: "That doesn't look like a single word",
    multiword: "One word at a time",
    tooLong: "Word is too long (over 30 letters)",
    serverError: "kirtis.info returned an error",
    networkError: "Couldn't reach kirtis.info",
    timeout: "The server didn't respond in time",
    noPermission: "No access to kirtis.info. Open the extension settings and grant permission.",
    openSettings: "Settings",
    retry: "Try again",
    copy: "Copy",
    copied: "Copied",
    cached: "cached",
    formsCount: n => `${n} form${n === 1 ? "" : "s"}`,

    ctxLookup: 'Show stress for "%s"',

    popupPlaceholder: "Lithuanian word",
    popupGo: "Look up",
    popupSettings: "Settings",
    popupError: "Error",

    optSubtitle: "Lithuanian word stress from the kirtis.info database",
    secAccess: "Access",
    grantBtn: "Grant access to kirtis.info",
    permGranted: "access granted",
    permMissing: "access not granted",

    secBehavior: "Behaviour",
    lblEnabled: "Enabled",
    hintEnabled: "React to text selected on pages",
    lblTrigger: "When a word is selected",
    trgButton: "Show a button",
    trgAuto: "Show the stress right away",
    lblLang: "Interface language",
    lblLatinOnly: "Latin script only",
    hintLatinOnly: "Don't offer the button for Cyrillic, CJK and so on",
    lblMinLength: "Minimum word length, letters",

    secPlacement: "Button position",
    lblAnchor: "Appears",
    anchorCursor: "At the cursor",
    anchorStart: "Above the start of the word",
    anchorEnd: "After the end of the word",
    lblOffsetX: "Horizontal offset, px",
    lblOffsetY: "Vertical offset, px",
    hintPlacement: "If the button collides with another extension's button (Simple Translate, for instance), change the anchor or set an offset.",

    secSites: "Excluded sites",
    lblDisabledHosts: "One domain per line",

    secCache: "Cache",
    lblUseCache: "Store answers locally",
    hintUseCache: "Fewer requests to kirtis.info, kept for 30 days",
    clearBtn: "Clear cache",
    cacheCleared: n => `entries removed: ${n}`,
    saved: "Saved"
  },

  lt: {
    langName: "Lietuvių",

    btnTitle: "Rodyti kirtį",
    loading: "Kraunama…",
    notFound: "Žodis nerastas kirtis.info duomenyse",
    invalid: "Panašu, kad tai ne vienas žodis",
    multiword: "Galima sukirčiuoti tik vieną žodį",
    tooLong: "Žodžio ilgis per didelis (daugiau nei 30 raidžių)",
    serverError: "kirtis.info serverio klaida",
    networkError: "Nepavyko susisiekti su kirtis.info",
    timeout: "Serveris neatsakė laiku",
    noPermission: "Nėra prieigos prie kirtis.info. Atidarykite nustatymus ir suteikite leidimą.",
    openSettings: "Nustatymai",
    retry: "Bandyti dar kartą",
    copy: "Kopijuoti",
    copied: "Nukopijuota",
    cached: "iš talpyklos",
    formsCount: n => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "forma" : (n % 10 === 0 || (n % 100 >= 11 && n % 100 <= 19) ? "formų" : "formos")}`,

    ctxLookup: "Sukirčiuoti „%s“",

    popupPlaceholder: "Lietuviškas žodis",
    popupGo: "Kirčiuoti",
    popupSettings: "Nustatymai",
    popupError: "Klaida",

    optSubtitle: "Lietuviškų žodžių kirčiavimas iš kirtis.info",
    secAccess: "Prieiga",
    grantBtn: "Suteikti prieigą prie kirtis.info",
    permGranted: "prieiga suteikta",
    permMissing: "prieiga nesuteikta",

    secBehavior: "Veikimas",
    lblEnabled: "Įjungta",
    hintEnabled: "Reaguoti į pažymėtą tekstą puslapiuose",
    lblTrigger: "Pažymėjus žodį",
    trgButton: "Rodyti mygtuką",
    trgAuto: "Iš karto rodyti kirtį",
    lblLang: "Sąsajos kalba",
    lblLatinOnly: "Tik lotyniški rašmenys",
    hintLatinOnly: "Nesiūlyti mygtuko kirilicai, hieroglifams ir pan.",
    lblMinLength: "Mažiausias žodžio ilgis, raidėmis",

    secPlacement: "Mygtuko vieta",
    lblAnchor: "Rodomas",
    anchorCursor: "Prie žymeklio",
    anchorStart: "Virš žodžio pradžios",
    anchorEnd: "Po žodžio pabaigos",
    lblOffsetX: "Poslinkis horizontaliai, px",
    lblOffsetY: "Poslinkis vertikaliai, px",
    hintPlacement: "Jei mygtukas užlipa ant kito priedo mygtuko (pvz., Simple Translate), pakeiskite vietą arba nustatykite poslinkį.",

    secSites: "Išimtys",
    lblDisabledHosts: "Po vieną domeną eilutėje",

    secCache: "Talpykla",
    lblUseCache: "Saugoti atsakymus vietoje",
    hintUseCache: "Mažiau užklausų į kirtis.info, saugoma 30 dienų",
    clearBtn: "Išvalyti talpyklą",
    cacheCleared: n => `pašalinta įrašų: ${n}`,
    saved: "Išsaugota"
  }
};

var KIRTIS_LANGS = ["ru", "en", "lt"];

function kirtisStrings(lang) {
  return KIRTIS_I18N[lang] || KIRTIS_I18N.en;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { KIRTIS_I18N, KIRTIS_LANGS, kirtisStrings };
}
