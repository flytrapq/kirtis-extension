/* Расшифровка грамматических сокращений kirtis.info.
   Источник: server/api/strp/strp.json из Sistemium/krc-angular (GPL-2.0).
   Формат: сокращение -> { lt, ru, en } */

var KIRTIS_ABBR = {
  // Giminė / Род
  "mot.gim.":    { lt: "Giminė: Moteriška giminė",  ru: "Род: женский", en: "Gender: feminine" },
  "vyr.gim.":    { lt: "Giminė: Vyriška giminė",    ru: "Род: мужской", en: "Gender: masculine" },
  "bendr.gim.":  { lt: "Giminė: Bendroji giminė",   ru: "Род: общий", en: "Gender: common" },
  "bevrd.gim.":  { lt: "Giminė: Bevardė giminė",    ru: "Род: средний", en: "Gender: neuter" },

  // Linksnis / Падеж
  "V.":  { lt: "Linksnis: Vardininkas",  ru: "Падеж: именительный", en: "Case: nominative" },
  "K.":  { lt: "Linksnis: Kilmininkas",  ru: "Падеж: родительный", en: "Case: genitive" },
  "N.":  { lt: "Linksnis: Naudininkas",  ru: "Падеж: дательный", en: "Case: dative" },
  "G.":  { lt: "Linksnis: Galininkas",   ru: "Падеж: винительный", en: "Case: accusative" },
  "Įn.": { lt: "Linksnis: Įnagininkas",  ru: "Падеж: творительный", en: "Case: instrumental" },
  "Vt.": { lt: "Linksnis: Vietininkas",  ru: "Падеж: местный", en: "Case: locative" },
  "Š.":  { lt: "Linksnis: Šauksmininkas", ru: "Падеж: звательный", en: "Case: vocative" },

  // Skaičius / Число
  "vnsk.": { lt: "Skaičius: Vienaskaita", ru: "Число: единственное", en: "Number: singular" },
  "dgsk.": { lt: "Skaičius: Daugiskaita", ru: "Число: множественное", en: "Number: plural" },

  // Laikas / Время
  "būs.l.":       { lt: "Laikas: Būsimasis laikas",        ru: "Время: будущее", en: "Tense: future" },
  "būt.kart.l.":  { lt: "Laikas: Būtasis kartinis laikas", ru: "Время: прошедшее однократное", en: "Tense: simple past" },
  "būt.d.l.":     { lt: "Laikas: Būtasis dažninis laikas", ru: "Время: прошедшее многократное", en: "Tense: past frequentative" },
  "būt.l.":       { lt: "Laikas: Būtasis laikas",          ru: "Время: прошедшее", en: "Tense: past" },
  "esam.l.":      { lt: "Laikas: Esamasis laikas",         ru: "Время: настоящее", en: "Tense: present" },

  // Grąžintinumas / Возвратность
  "nesngr.": { lt: "Grąžintinumas: Nesangrąžinis", ru: "Невозвратный глагол", en: "Non-reflexive verb" },
  "sngr.":   { lt: "Grąžintinumas: Sangrąžinis",   ru: "Возвратный глагол", en: "Reflexive verb" },

  // Nuosaka / Наклонение
  "Ties.": { lt: "Nuosaka: Tiesioginė nuosaka",  ru: "Наклонение: изъявительное", en: "Mood: indicative" },
  "Tar.":  { lt: "Nuosaka: Tariamoji nuosaka",   ru: "Наклонение: сослагательное", en: "Mood: subjunctive" },
  "Liep.": { lt: "Nuosaka: Liepiamoji nuosaka",  ru: "Наклонение: повелительное", en: "Mood: imperative" },

  // Asmuo / Лицо
  "Iasm.":   { lt: "Asmuo: Pirmas asmuo",  ru: "Лицо: 1-е", en: "Person: 1st" },
  "IIasm.":  { lt: "Asmuo: Antras asmuo",  ru: "Лицо: 2-е", en: "Person: 2nd" },
  "IIIasm.": { lt: "Asmuo: Trečias asmuo", ru: "Лицо: 3-е", en: "Person: 3rd" },

  // Įvardis / Местоименность
  "įvardž.":   { lt: "Įvardis: Įvardžiuotinė forma",   ru: "Местоименная форма", en: "Pronominal form" },
  "neįvardž.": { lt: "Įvardis: Neįvardžiuotinė forma", ru: "Неместоименная форма", en: "Non-pronominal form" },

  // Skaitvardis / Числительное
  "kiekin.":   { lt: "Skaitvardis: Kiekinis",   ru: "Числительное: количественное", en: "Numeral: cardinal" },
  "daugin.":   { lt: "Skaitvardis: Dauginis",   ru: "Числительное: множительное", en: "Numeral: multiplicative" },
  "kuopin.":   { lt: "Skaitvardis: Kuopinis",   ru: "Числительное: собирательное", en: "Numeral: collective" },
  "kelintin.": { lt: "Skaitvardis: Kelintinis", ru: "Числительное: порядковое", en: "Numeral: ordinal" },

  // Rūšis / Залог
  "neveik.r.": { lt: "Rūšis: Neveikiamoji rūšis", ru: "Залог: страдательный", en: "Voice: passive" },
  "veik.r.":   { lt: "Rūšis: Veikiamoji rūšis",   ru: "Залог: действительный", en: "Voice: active" },

  // Kiti / Прочее
  "sutrmp.":    { lt: "Kiti: Sutrumpinimas",        ru: "Сокращение", en: "Abbreviation" },
  "T.":         { lt: "Kiti: Tikrinis daiktavardis", ru: "Имя собственное", en: "Proper noun" },
  "reikiamyb.": { lt: "Kiti: Reikiamybės dalyvis",  ru: "Причастие долженствования", en: "Participle of necessity" },

  // Kalbos dalis / Часть речи
  "dktv.":   { lt: "Kalbos dalis: Daiktavardis", ru: "Часть речи: существительное", en: "Part of speech: noun" },
  "bdvr.":   { lt: "Kalbos dalis: Būdvardis",    ru: "Часть речи: прилагательное", en: "Part of speech: adjective" },
  "vksm.":   { lt: "Kalbos dalis: Veiksmažodis", ru: "Часть речи: глагол", en: "Part of speech: verb" },
  "dlv.":    { lt: "Kalbos dalis: Dalyvis",      ru: "Часть речи: причастие", en: "Part of speech: participle" },
  "psdlv.":  { lt: "Kalbos dalis: Pusdalyvis",   ru: "Часть речи: полупричастие", en: "Part of speech: half-participle" },
  "padlv.":  { lt: "Kalbos dalis: Padalyvis",    ru: "Часть речи: деепричастие", en: "Part of speech: adverbial participle" },
  "būdn.":   { lt: "Kalbos dalis: Būdinys",      ru: "Часть речи: инфинитив образа действия", en: "Part of speech: manner infinitive" },
  "įvrd.":   { lt: "Kalbos dalis: Įvardis",      ru: "Часть речи: местоимение", en: "Part of speech: pronoun" },
  "sktv.":   { lt: "Kalbos dalis: Skaitvardis",  ru: "Часть речи: числительное", en: "Part of speech: numeral" },
  "prvks.":  { lt: "Kalbos dalis: Prieveiksmis", ru: "Часть речи: наречие", en: "Part of speech: adverb" },
  "prlnks.": { lt: "Kalbos dalis: Prielinksnis", ru: "Часть речи: предлог", en: "Part of speech: preposition" },
  "jngt.":   { lt: "Kalbos dalis: Jungtukas",    ru: "Часть речи: союз", en: "Part of speech: conjunction" },
  "dll.":    { lt: "Kalbos dalis: Dalelytė",     ru: "Часть речи: частица", en: "Part of speech: particle" },
  "jstk.":   { lt: "Kalbos dalis: Jaustukas",    ru: "Часть речи: междометие", en: "Part of speech: interjection" },
  "ištk.":   { lt: "Kalbos dalis: Ištiktukas",   ru: "Часть речи: звукоподражание", en: "Part of speech: onomatopoeia" }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = KIRTIS_ABBR;
}
