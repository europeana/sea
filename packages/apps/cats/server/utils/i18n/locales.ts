const locales = [
  "bg-BG",
  "cs-CZ",
  "da-DK",
  "de-DE",
  "el-GR",
  "es-ES",
  "et-EE",
  "fi-FI",
  "fr-FR",
  "ga-IE",
  "hr-HR",
  "hu-HU",
  "it-IT",
  "lt-LT",
  "lv-LV",
  "mt-MT",
  "nl-NL",
  "pl-PL",
  "pt-PT",
  "ro-RO",
  "sk-SK",
  "sl-SI",
  "sv-SE",
];

export const targetLanguages = locales.map((locale) =>
  locale.split("-").shift().toUpperCase(),
);

export const localeForLang = (lang) =>
  locales.find((locale) => locale.startsWith(`${lang.toLowerCase()}-`));
