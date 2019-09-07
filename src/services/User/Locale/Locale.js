import _map from 'lodash/map'
import _isString from 'lodash/isString'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'
import afMessages from '../../../lang/af.json'
import bgMessages from '../../../lang/bg.json'
import csCZMessages from '../../../lang/cs_CZ.json'
import deMessages from '../../../lang/de.json'
import enUSMessages from '../../../lang/en-US.json'
import esMessages from '../../../lang/es.json'
import faIRMessages from '../../../lang/fa_IR.json'
import faMessages from '../../../lang/fa.json'
import frMessages from '../../../lang/fr.json'
import glMessages from '../../../lang/gl.json'
import jaMessages from '../../../lang/ja.json'
import koMessages from '../../../lang/ko.json'
import nlMessages from '../../../lang/nl.json'
import ptBRMessages from '../../../lang/pt_BR.json'
import ptPTMessages from '../../../lang/pt_PT.json'
import roMessages from '../../../lang/ro.json'
import ruRUMessages from '../../../lang/ru_RU.json'
import trMessages from '../../../lang/tr.json'




// Supported locales.
export const Locale = Object.freeze({
  af: 'af',
  bg: 'bg',
  csCZ: 'cs_CZ',
  de: 'de',
  enUS: 'en-US',
  es: 'es',
  faIR: 'fa_IR',
  fa: 'fa',
  fr: 'fr',
  gl: 'gl',
  ja: 'ja',
  ko: 'ko',
  nl: 'nl',
  ptBR: 'pt_BR',
  ptPT: 'pt_PT',
  ro: 'ro',
  ruRU: 'ru_RU',
  tr: 'tr'
})

/**
 * Returns true if the given locale matches a supported locale, false
 * otherwise.
 */
export const isSupportedLocale = function(locale) {
  return _isString(locale) && _isString(Locale[locale])
}

/**
 * Mapped locales to translated messages loaded from src/lang translation
 * files.
 */
export const translatedMessages = Object.freeze({
  [Locale.af]: afMessages,
  [Locale.bg]: bgMessages,
  [Locale.csCZ]: csCZMessages,
  [Locale.de]: deMessages,
  [Locale.enUS]: enUSMessages,
  [Locale.es]: esMessages,
  [Locale.faIR]: faIRMessages,
  [Locale.fa]: faMessages,
  [Locale.fr]: frMessages,
  [Locale.gl]: glMessages,
  [Locale.ja]: jaMessages,
  [Locale.ko]: koMessages,
  [Locale.nl]: nlMessages,
  [Locale.ptBR]: ptBRMessages,
  [Locale.ptPT]: ptPTMessages,
  [Locale.ro]: roMessages,
  [Locale.ruRu]: ruRUMessages,
  [Locale.tr]: trMessages,
  
})

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
