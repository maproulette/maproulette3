import _map from 'lodash/map'
import _isString from 'lodash/isString'
import _fromPairs from 'lodash/fromPairs'
import messages from './Messages'
import enUSMessages from '../../../lang/en-US.json'
import esMessages from '../../../lang/es.json'
import frMessages from '../../../lang/fr.json'
import deMessages from '../../../lang/de.json'
import afMessages from '../../../lang/af.json'
import jaMessages from '../../../lang/ja.json'
import koMessages from '../../../lang/ko.json'
import ptBRMessages from '../../../lang/pt-BR.json'

// Supported locales.
export const Locale = Object.freeze({
  enUS: 'en-US',
  es: 'es',
  fr: 'fr',
  de: 'de',
  af: 'af',
  ja: 'ja',
  ko: 'ko',
  'pt-BR': 'pt-BR',
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
  [Locale.enUS]: enUSMessages,
  [Locale.es]: esMessages,
  [Locale.fr]: frMessages,
  [Locale.de]: deMessages,
  [Locale.af]: afMessages,
  [Locale.ja]: jaMessages,
  [Locale.ko]: koMessages,
  [Locale["pt-BR"]]: ptBRMessages,
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
