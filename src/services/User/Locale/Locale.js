import { addLocaleData } from 'react-intl'
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
  [Locale.enUS]: () => {
    return import('react-intl/locale-data/en').then(en => {
      addLocaleData([...en.default])
      return import('../../../lang/en-US.json')
    })
  },
  [Locale.es]: () => {
    return import('react-intl/locale-data/es').then(es => {
      addLocaleData([...es.default])
      return import('../../../lang/es.json')
    })
  },
  [Locale.fr]: () => {
    return import('react-intl/locale-data/fr').then(fr => {
      addLocaleData([...fr.default])
      return import('../../../lang/fr.json')
    })
  },
  [Locale.de]: () => {
    return import('react-intl/locale-data/de').then(de => {
      addLocaleData([...de.default])
      return import('../../../lang/de.json')
    })
  },
  [Locale.af]: () => {
    return import('react-intl/locale-data/af').then(af => {
      addLocaleData([...af.default])
      return import('../../../lang/af.json')
    })
  },
  [Locale.ja]: () => {
    return import('react-intl/locale-data/ja').then(ja => {
      addLocaleData([...ja.default])
      return import('../../../lang/ja.json')
    })
  },
  [Locale.ko]: () => {
    return import('react-intl/locale-data/ko').then(ko => {
      addLocaleData([...ko.default])
      return import('../../../lang/ko.json')
    })
  },
  [Locale.nl]: () => {
    return import('react-intl/locale-data/nl').then(nl => {
      addLocaleData([...nl.default])
      return import('../../../lang/nl.json')
    })
  },
  [Locale["pt-BR"]]: () => {
    return import('react-intl/locale-data/pt').then(pt => {
      addLocaleData([...pt.default])
      return import('../../../lang/pt_BR.json')
    })
  },
  [Locale["cs-CZ"]]: () => {
    return import('react-intl/locale-data/cs').then(cs => {
      addLocaleData([...cs.default])
      return import('../../../lang/cs_CZ.json')
    })
  },
  [Locale["fa-IR"]]: () => {
    return import('react-intl/locale-data/fa').then(fa => {
      addLocaleData([...fa.default])
      return import('../../../lang/fa_IR.json')
    })
  },
  [Locale["ru-RU"]]: () => {
    return import('react-intl/locale-data/ru').then(ru => {
      addLocaleData([...ru.default])
      return import('../../../lang/ru_RU.json')
    })
  },
  [Locale.uk]: () => {
    return import('react-intl/locale-data/uk').then(uk => {
      addLocaleData([...uk.default])
      return import('../../../lang/uk.json')
    })
  },
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
