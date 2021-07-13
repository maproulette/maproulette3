import "@formatjs/intl-relativetimeformat/polyfill";
import _map from "lodash/map";
import _isString from "lodash/isString";
import _fromPairs from "lodash/fromPairs";
import messages from "./Messages";

// To add support for a new locale, add it to both `Locale` and `LocaleImports`
// in this file, and then add a description of the new locale to the
// `Messages.js` file in this directory

// Supported locales
export const Locale = Object.freeze({
  enUS: "en-US",
  es: "es",
  fr: "fr",
  de: "de",
  af: "af",
  ja: "ja",
  ko: "ko",
  nl: "nl",
  "pt-BR": "pt-BR",
  "cs-CZ": "cs-CZ",
  "fa-IR": "fa-IR",
  "ru-RU": "ru-RU",
  uk: "uk",
  vi: "vi",
  tr: "tr",
  pl: "pl",
  "zh-TW": "zh-TW"
});

// Dynamic imports to load locale data and translation files
const LocaleImports = {
  [Locale.enUS]: () =>
    Promise.all([
      import("../../../lang/en-US.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/en"),
    ]),
  [Locale.es]: () =>
    Promise.all([
      import("../../../lang/es.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/es"),
    ]),
  [Locale.fr]: () =>
    Promise.all([
      import("../../../lang/fr.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/fr"),
    ]),
  [Locale.de]: () =>
    Promise.all([
      import("../../../lang/de.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/de"),
    ]),
  [Locale.af]: () =>
    Promise.all([
      import("../../../lang/af.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/af"),
    ]),
  [Locale.ja]: () =>
    Promise.all([
      import("../../../lang/ja.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/ja"),
    ]),
  [Locale.ko]: () =>
    Promise.all([
      import("../../../lang/ko.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/ko"),
    ]),
  [Locale.nl]: () =>
    Promise.all([
      import("../../../lang/nl.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/nl"),
    ]),
  [Locale.uk]: () =>
    Promise.all([
      import("../../../lang/uk.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/uk"),
    ]),
  [Locale.vi]: () =>
    Promise.all([
      import("../../../lang/vi.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/vi"),
    ]),
  [Locale["pt-BR"]]: () =>
    Promise.all([
      import("../../../lang/pt_BR.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/pt"),
    ]),
  [Locale["cs-CZ"]]: () =>
    Promise.all([
      import("../../../lang/cs_CZ.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/cs"),
    ]),
  [Locale["fa-IR"]]: () =>
    Promise.all([
      import("../../../lang/fa_IR.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/fa"),
    ]),
  [Locale["ru-RU"]]: () =>
    Promise.all([
      import("../../../lang/ru_RU.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/ru"),
    ]),
  [Locale.tr]: () =>
    Promise.all([
      import("../../../lang/tr.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/tr"),
    ]),
  [Locale.pl]: () =>
    Promise.all([
      import("../../../lang/pl.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/pl"),
    ]),
  [Locale["zh-TW"]]: () =>
    Promise.all([
      import("../../../lang/zh_TW.json"),
      import("@formatjs/intl-relativetimeformat/locale-data/zh"),
    ]),
};

/**
 * Returns true if the given locale matches a supported locale, false
 * otherwise.
 */
export const isSupportedLocale = function (locale) {
  return _isString(locale) && _isString(Locale[locale]);
};

/**
 * Dynamically load and return the translated messages for the given locale
 */
export const loadTranslatedMessages = async function (locale) {
  if (!isSupportedLocale(locale)) {
    locale = defaultLocale();
  }

  const [messages] = await LocaleImports[locale]();
  return messages;
};

/**
 * Returns the default locale configured in the .env file, or U.S.  English if
 * no default is configured or if the configured locale isn't supported.
 */
export const defaultLocale = function () {
  const configured = process.env.REACT_APP_DEFAULT_LOCALE;

  return isSupportedLocale(configured) ? configured : Locale.enUS;
};

/**
 * Returns an object mapping label messages for locale values to raw
 * internationalized messages suitable for use with FormattedMessage or
 * formatMessage.
 *
 * > Note that these are the messages for the locale labels themselves (like
 * > 'U.S. English' for en-US or 'Spanish' for es), not to be confused with
 * > translated messages for a locale.
 */
export const labelMessagesByLocale = _fromPairs(
  _map(messages, (message, key) => [Locale[key], message])
);

/** Returns object containing localized labels  */
export const localeLabels = (intl) =>
  _fromPairs(
    _map(messages, (message, key) => [key, intl.formatMessage(message)])
  );
