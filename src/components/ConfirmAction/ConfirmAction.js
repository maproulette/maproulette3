import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import Modal from '../Modal/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ConfirmAction.scss'

/**
 * ConfirmAction intercepts the onClick (or other specified action) of the
 * immediate child and instead presents a confirmation modal asking the user to
 * confirm their desired action. Upon confirmation, the original onClick or
 * specified action function is invoked. If desired, a skipConfirmation function
 * can be provided that will be invoked (and passed the original event) before
 * each possible interception, causing confirmation to be skipped if the
 * function returns a truthy value
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ConfirmAction extends Component {
  originalAction = null

  state = {
    confirming: false,
  }

  initiateConfirmation = e => {
    if (this.props.skipConfirmation && this.props.skipConfirmation(e)) {
      if (this.originalAction) {
        this.originalAction(e)
      }
    }
    else {
      this.setState({confirming: true, originalEvent: _cloneDeep(e)})
    }
  }

  cancel = () => this.setState({confirming: false})

  proceed = () => {
    const event = this.state.originalEvent

    this.setState({confirming: false, originalEvent: null})
    if (this.originalAction) {
      this.originalAction(event)
    }
  }

  render() {
    const action = this.props.action ? this.props.action : 'onClick'
    this.originalAction = _get(this.props.children, `props.${action}`)

    const ControlWithConfirmation =
      React.cloneElement(this.props.children, {[action]: this.initiateConfirmation})

    return (
      <React.Fragment>
        {ControlWithConfirmation}

        <Modal
          narrowColumn
          fullBleed
          onClose={this.cancel}
          isActive={this.state.confirming}
        >
          <article>
            <div className="mr-top-0 mr-absolute">
              <SvgSymbol
                className="mr-fill-white-04 mr-w-48 mr-h-48 mr-mt-4 mr-ml-8"
                viewBox='0 0 20 20'
                sym='alert-icon'
              />
            </div>
            <div className="mr-flex mr-flex-col mr-items-center mr-px-8 mr-pt-12">
              <div className="mr-w-full mr-flex mr-justify-center mr-mb-4">
                <SvgSymbol
                  className="mr-fill-red mr-h-10 mr-h-10"
                  viewBox='0 0 20 20'
                  sym='alert-icon'
                />
              </div>
              <div className="mr-text-3xl mr-mb-4">
                {this.props.title || <FormattedMessage {...messages.title} />}
              </div>
              <div className="mr-font-medium">
                {this.props.prompt || <FormattedMessage {...messages.prompt} />}
              </div>
            </div>

            <div className="mr-mt-16 mr-bg-blue-cloudburst mr-p-8 mr-flex mr-justify-center mr-items-center">
              <button
                className="mr-button mr-button--green-lighter mr-mr-8"
                onClick={this.cancel}
              >
                <FormattedMessage {...messages.cancel} />
              </button>

              <button
                className="mr-button mr-button--danger"
                onClick={this.proceed}
              >
                <FormattedMessage {...messages.proceed} />
              </button>
            </div>
          </article>
        </Modal>
      </React.Fragment>
    )
  }
}

ConfirmAction.propTypes = {
  title: PropTypes.node,
  prompt: PropTypes.node,
  /** Skip confirmation step if function returns true */
  skipConfirmation: PropTypes.func,
  /** Optional action to intercept. Defaults to onClick */
  action: PropTypes.string,
}
