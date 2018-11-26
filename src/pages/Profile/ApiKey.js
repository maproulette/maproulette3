import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Button from '../../components/Button/Button'
import ConfirmAction from '../../components/ConfirmAction/ConfirmAction'
import messages from './Messages'

export default class ApiKey extends Component {
  render() {
    return (
      <section className="mr-section mr-section--as-header">
        <header className="mr-flex mr-items-center mr-justify-between mr-mb-4">
          <h2 className="mr-h4">
            <FormattedMessage {...messages.apiKey} />
          </h2>
          <ConfirmAction>
            <Button
              className="mr-button--small"
              onClick={() => this.props.resetAPIKey(this.props.user.id)}
            >
              <FormattedMessage {...messages.apiKeyResetLabel} />
            </Button>
          </ConfirmAction>
        </header>
        <div className="mr-flex">
          <input
            type="text"
            disabled
            className="mr-input mr-border-none mr-rounded-r-none"
            value={this.props.user.apiKey}
          />
          <CopyToClipboard text={this.props.user.apiKey}>
            <button className="mr-input mr-bg-green-light mr-text-white hover:mr-bg-green-lighter hover:mr-text-green-dark mr-font-medium mr-border-none mr-rounded-l-none mr-w-32">
              <FormattedMessage {...messages.apiKeyCopyLabel} />
            </button>
          </CopyToClipboard>
        </div>
      </section>
    )
  }
}

ApiKey.propTypes = {
  user: PropTypes.object,
  resetAPIKey: PropTypes.func.isRequired,
}
