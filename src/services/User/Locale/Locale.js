// Functions which load translated strings for a particular language when called.
// It's important that (1) these aren't imported at the top level (we don't want
// to bloat the main bundle with all strings for every language) but also that
// the argument to the import() function is a literal string (so that our bundler
// can analyze it and include those assets in the output dist/ directory).
const LOCALE_LOADERS = {
  "af": () => import("../../../../lang/af.json"),
  "cs-CZ": () => import("../../../../lang/cs_CZ.json"),
  "de": () => import("../../../../lang/de.json"),
  "en-US": () => import("../../../../lang/en-US.json"),
  "es": () => import("../../../../lang/es.json"),
  "fa-IR": () => import("../../../../lang/fa_IR.json"),
  "fr": () => import("../../../../lang/fr.json"),
  "it": () => import("../../../../lang/it_IT.json"),
  "ja": () => import("../../../../lang/ja.json"),
  "ko": () => import("../../../../lang/ko.json"),
  "nl": () => import("../../../../lang/nl.json"),
  "pl": () => import("../../../../lang/pl.json"),
  "pt-BR": () => import("../../../../lang/pt_BR.json"),
  "pt-PT": () => import("../../../../lang/pt_PT.json"),
  "ru-RU": () => import("../../../../lang/ru_RU.json"),
  "sr": () => import("../../../../lang/sr.json"),
  "tr": () => import("../../../../lang/tr.json"),
  "uk": () => import("../../../../lang/uk.json"),
  "vi": () => import("../../../../lang/vi.json"),
  "zh-TW": () => import("../../../../lang/zh_TW.json"),
};

// Array of supported locale identifiers
export const SUPPORTED_LOCALES = Object.keys(LOCALE_LOADERS);

// Locale names are shown in the language picker alongside the ISO codes. These
// are intentionally NOT localized, so that if a user is "stuck" in a language
// they don't understand, they'll still be able to recognize their own language
// in this list.
export const LOCALE_NAMES = {
  "af": "Afrikaans",
  "cs-CZ": "Čeština",
  "de": "Deutsch",
  "en-US": "English (U.S.)",
  "es": "Español",
  "fa-IR": "فارسی",
  "fr": "Français",
  "it": "Italiano",
  "ja": "日本語",
  "ko": "한국어",
  "nl": "Nederlands",
  "pl": "Polski",
  "pt-BR": "Português Brasileiro",
  "pt-PT": "Português Portugal",
  "ru-RU": "Русский",
  "sr": "Српски",
  "tr": "Türkçe",
  "uk": "Українська",
  "vi": "tiếng Việt",
  "zh-TW": "國語",
};

/**
 * Returns true if the given locale matches a supported locale, false
 * otherwise.
 */
export const isSupportedLocale = function (locale) {
  return SUPPORTED_LOCALES.includes(locale);
};

/**
 * Dynamically load and return the translated messages for the given locale
 */
export const loadTranslatedMessages = async function (locale) {
  if (!isSupportedLocale(locale)) {
    locale = defaultLocale();
  }

  // load the locale data asynchronously
  const loader = LOCALE_LOADERS[locale];
  const module = await loader();
  // loader returns a module, the JSON data is in its default export
  return module.default;
};

/**
 * Returns the default locale configured in the .env file, or U.S. English if
 * no default is configured or if the configured locale isn't supported.
 */
export const defaultLocale = function () {
  const configured = window.env.REACT_APP_DEFAULT_LOCALE;
  return isSupportedLocale(configured) ? configured : "en-US";
};
