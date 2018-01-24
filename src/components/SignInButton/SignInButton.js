import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import messages from './Messages'
import './SignInButton.css'

/**
 * Renders a sign-in button that takes the user to OpenStreetMap oauth
 * authorization page (configured in the .env file) when clicked. The button
 * will show a busy spinner after being clicked in case the network connection
 * is slow and it takes a few moments for the OSM page to load. It also shows a
 * busy spinner if the app is in the process of confirming the user's login
 * status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class SignInButton extends Component {
  state = {
    clicked: false,
  }

  render() {
    return (
      <a className={classNames("button is-outlined signin-button",
                              {"is-loading": this.state.clicked || this.props.checkingLoginStatus},
                              this.props.className)}
         onClick={() => this.setState({clicked: true})}
         href={`${process.env.REACT_APP_SERVER_OAUTH_URL}${this.props.history.location.pathname}`}
      >
        {this.props.children ||
        <FormattedMessage {...messages.control} />
        }
      </a>
    )
  }
}

export default WithStatus(SignInButton)
