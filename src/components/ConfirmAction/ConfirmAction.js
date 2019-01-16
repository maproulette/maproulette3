import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import Modal from '../Bulma/Modal'
import messages from './Messages'
import './ConfirmAction.scss'

/**
 * ConfirmAction intercepts the onClick control of the immediate child and
 * instead presents a confirmation modal asking the user to confirm their
 * desired action. Upon confirmation, the original onClick function is
 * invoked.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ConfirmAction extends Component {
  originalOnClick = null

  state = {
    confirming: false,
  }

  initiateConfirmation = () => this.setState({confirming: true})

  cancel = () => this.setState({confirming: false})

  proceed = e => {
    this.setState({confirming: false})

    if (this.originalOnClick) {
      this.originalOnClick(e)
    }
  }

  render() {
    this.originalOnClick = _get(this.props.children, 'props.onClick')

    const ControlWithConfirmation =
      React.cloneElement(this.props.children,
                         {onClick: this.initiateConfirmation})

    return (
      <div className="confirm-action">
        {ControlWithConfirmation}

        <Modal className="confirm-action__modal" onClose={this.cancel} isActive={this.state.confirming}>
          <article className="message is-danger">
            <div className="message-header">
              {this.props.title || <FormattedMessage {...messages.title} />}
            </div>
            <div className="message-body">
              <div className="confirm-action__prompt">
                {this.props.prompt || <FormattedMessage {...messages.prompt} />}
              </div>

              <div className="confirm-action__controls">
                <button className="button is-secondary is-outlined confirm-action__cancel-control"
                        onClick={this.cancel}>
                  <FormattedMessage {...messages.cancel} />
                </button>

                <button className="button is-danger is-outlined confirm-action__proceed-control"
                        onClick={this.proceed}>
                  <FormattedMessage {...messages.proceed} />
                </button>
              </div>
            </div>
          </article>
        </Modal>
      </div>
    )
  }
}

ConfirmAction.propTypes = {
  title: PropTypes.node,
  prompt: PropTypes.node,
}
