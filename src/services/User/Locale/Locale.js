import _map from 'lodash/map'
import _isString from 'lodash/isString'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'

// To add support for a new locale, add it to both `Locale` and `LocaleImports`
// in this file, and then add a description of the new locale to the
// `Messages.js` file in this directory

// Supported locales
export const Locale = Object.freeze({
  enUS: 'en-US',
  es: 'es',
  fr: 'fr',
  de: 'de',
  af: 'af',
  ja: 'ja',
  ko: 'ko',
  nl: 'nl',
  'pt-BR': 'pt-BR',
  'cs-CZ': 'cs-CZ',
  'fa-IR': 'fa-IR',
  'ru-RU': 'ru-RU',
  uk: 'uk',
})

// Dynamic imports to load locale data and translation files
const LocaleImports = {
  [Locale.enUS]: () => import('../../../lang/en-US.json'),
  [Locale.es]: () => import('../../../lang/es.json'),
  [Locale.fr]: () => import('../../../lang/fr.json'),
  [Locale.de]: () => import('../../../lang/de.json'),
  [Locale.af]: () => import('../../../lang/af.json'),
  [Locale.ja]: () => import('../../../lang/ja.json'),
  [Locale.ko]: () => import('../../../lang/ko.json'),
  [Locale.nl]: () => import('../../../lang/nl.json'),
  [Locale.uk]: () => import('../../../lang/uk.json'),
  [Locale["pt-BR"]]: () => import('../../../lang/pt_BR.json'),
  [Locale["cs-CZ"]]: () => import('../../../lang/cs_CZ.json'),
  [Locale["fa-IR"]]: () => import('../../../lang/fa_IR.json'),
  [Locale["ru-RU"]]: () => import('../../../lang/ru_RU.json'),
}

/**
 * Returns true if the given locale matches a supported locale, false
 * otherwise.
 */
export const isSupportedLocale = function(locale) {
  return _isString(locale) && _isString(Locale[locale])
}

/**
 * Dynamically load and return the translated messages for the given locale
 */
export const loadTranslatedMessages = async function(locale) {
  if (!isSupportedLocale(locale)) {
    locale = defaultLocale()
  }

  const messages = await LocaleImports[locale]()
  return messages
}

/**
 * Returns the default locale configured in the .env file, or U.S.  English if
 * no default is configured or if the configured locale isn't supported.
 */
export const defaultLocale = function() {
  const configured = process.env.REACT_APP_DEFAULT_LOCALE

  return isSupportedLocale(configured) ? configured : Locale.enUS
}

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
)

/** Returns object containing localized labels  */
export const localeLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)
