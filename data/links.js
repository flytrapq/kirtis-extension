/* Внешние словари, куда можно уйти за переводом и примерами употребления.

   Почему ссылки, а не встроенный перевод: на странице слово стоит в форме
   (krosnies, pasėdėti), а словарные API индексируют начальную форму. Поиск на
   стороне сайта сам разбирается с формой, а расширению не нужны ни ключи, ни
   новые разрешения, ни согласования с ещё одним сервисом. */

var KIRTIS_LINKS = [
  {
    id: "glosbe",
    title: "Glosbe",
    // Двуязычный корпус: перевод плюс примеры из реальных параллельных текстов.
    url: (word, lang) => `https://glosbe.com/lt/${lang === "ru" ? "ru" : "en"}/${encodeURIComponent(word)}`
  },
  {
    id: "wiktionary",
    title: "Wiktionary",
    // Определения и таблицы склонений; у английского раздела литовский покрыт прилично.
    url: (word, lang) => {
      const w = encodeURIComponent(word);
      if (lang === "ru") return `https://ru.wiktionary.org/wiki/${w}`;
      if (lang === "lt") return `https://lt.wiktionary.org/wiki/${w}`;
      return `https://en.wiktionary.org/wiki/${w}#Lithuanian`;
    }
  },
  {
    id: "deepl",
    title: "DeepL",
    // Машинный перевод для случаев, когда словарной статьи не нашлось.
    url: (word, lang) => `https://www.deepl.com/translator#lt/${lang === "ru" ? "ru" : "en"}/${encodeURIComponent(word)}`
  }
];

function kirtisLinks(word, lang) {
  return KIRTIS_LINKS.map(s => ({ id: s.id, title: s.title, href: s.url(word, lang) }));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { KIRTIS_LINKS, kirtisLinks };
}
