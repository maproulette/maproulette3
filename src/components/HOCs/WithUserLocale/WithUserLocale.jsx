import { Component } from 'react'
import {
  isSupportedLocale,
  defaultLocale,
  loadTranslatedMessages,
} from '../../../services/User/Locale/Locale'
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
export const WithUserLocale = function(WrappedComponent) {
  return class extends Component {
    state = {
      localeMessages: null,
    }

    activeLocale = props => {
      const userLocale = props.user?.settings?.locale
      return isSupportedLocale(userLocale) ? userLocale : defaultLocale()
    }

    loadLocale = () => {
      loadTranslatedMessages(this.activeLocale(this.props)).then(messages => {
        this.setState({localeMessages: messages})
      })
    }

    componentDidMount() {
      this.loadLocale()
    }

    componentDidUpdate(prevProps) {
      if (this.activeLocale(this.props) !== this.activeLocale(prevProps)) {
        this.loadLocale()
      }
    }

    render() {
      // Wait until initial locale messages are loaded before showing content
      if (!this.state.localeMessages) {
        return null
      }

      return (
        <WrappedComponent
          {...this.props}
          locale={this.activeLocale(this.props)}
          messages={this.state.localeMessages}
        />
      )
    }
  };
}

export default WrappedComponent =>
  WithCurrentUser(WithUserLocale(WrappedComponent))
