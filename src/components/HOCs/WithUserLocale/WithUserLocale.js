import { connect } from 'react-redux'
import _get from 'lodash/get'
import { isSupportedLocale,
         translatedMessages,
         defaultLocale } from '../../../services/User/Locale/Locale'
import WithCurrentUser from '../WithCurrentUser/WithCurrentUser'

/**
 * WithUserLocale passes down the current user's locale, as well as translated
 * messages for that locale. It's primarily intended for wrapping a react-intl
 * IntlProvider to ensure that it receives updated locale data if the user
 * changes their locale setting.
 *
 * The default locale is returned if the user does not have a locale setting or
 * their locale isn't supported.
 *
 * @see User/Locale
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithUserLocale =
  WrappedComponent => WithCurrentUser(connect(mapStateToProps)(WrappedComponent))

export const mapStateToProps = (state, ownProps) => {
  const locale = ownProps.user ?
                 _get(ownProps.user, `settings.locale`) : null

  if (isSupportedLocale(locale)) {
    return {locale, messages: translatedMessages[locale]}
  }
  else {
    return {
      locale: defaultLocale(),
      messages: translatedMessages[defaultLocale()],
    }
  }
}

export default WithUserLocale
