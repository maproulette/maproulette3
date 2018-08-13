import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import ConfirmAction from '../ConfirmAction/ConfirmAction'
import messages from './Messages'

export default class ApiKey extends Component {
  render() {
    return (
      <div className={classNames("user-profile__api-key", this.props.className)}>
        <div className="user-profile__api-key__header">
          <h2 className="subtitle">
            <FormattedMessage {...messages.apiKey} />

            <CopyToClipboard text={this.props.user.apiKey}>
              <button className="button is-clear has-svg-icon user-profile__api-key__copy-button">
                <SvgSymbol viewBox='0 0 20 20' sym="clipboard-icon" />
                <FormattedMessage {...messages.apiKeyCopyLabel} />
              </button>
            </CopyToClipboard>
          </h2>

          <ConfirmAction>
            <button className="button is-danger is-outlined user-profile__api-key__reset-button"
                    onClick={() => this.props.resetAPIKey(this.props.user.id)}>
                <FormattedMessage {...messages.apiKeyResetLabel} />
            </button>
          </ConfirmAction>
        </div>

        <pre className="user-profile__api-key__current-key">
          {this.props.user.apiKey}
        </pre>
      </div>
    )
  }
}

ApiKey.propTypes = {
  user: PropTypes.object,
  resetAPIKey: PropTypes.func.isRequired,
}
