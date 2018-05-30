import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

export default class ApiKey extends Component {
  render() {
    return (
      <div className={classNames("user-profile__api-key", this.props.className)}>
        <h2 className="subtitle">
          <FormattedMessage {...messages.apiKey} />
        </h2>

        <pre className="user-profile__api-key--current-key">
          {this.props.user.apiKey}
        </pre>
      </div>
    )
  }
}

ApiKey.propTypes = {
  user: PropTypes.object,
}
