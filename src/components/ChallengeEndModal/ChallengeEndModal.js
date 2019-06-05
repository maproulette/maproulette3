import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from '../Bulma/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * ChallengeEndModal presents a modal that displays a
 * message that this challenge has reached the end.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ChallengeEndModal extends Component {
  state = {
    active: true,
  }

  dismiss = () => this.setState({active: false})

  render() {
    return (
      <Modal className="challenge-end-modal"
             contentClassName="mr-bg-blue-dark mr-w-sm"
             isActive={this.state.active}
             onClose={this.dismiss}>
        <div className="mr-bg-blue-dark mr-p-8">
          <div className="mr-text-right mr-text-green-lighter"
               aria-label="close" >
            <button className="mr-text-green-lighter" onClick={this.dismiss}>
              <SvgSymbol sym="outline-close-icon" viewBox="0 0 20 20"
                        className="icon mr-fill-current" />
            </button>
          </div>
          <div className="mr-bg-blue-dark mr-text-white mr-text-center">
            <div>
              <h2 className="mr-text-yellow mr-text-4xl mr-mb-4">
                <FormattedMessage {...messages.header} />
              </h2>
              <div className="form mr-mt-2 mr-py-4">
                <p className="mr-mr-4 mr-text-lg">
                  <FormattedMessage {...messages.primaryMessage} />
                </p>
              </div>
            </div>
            <div className="mr-text-center mr-mt-6">
              <button className="mr-button" onClick={this.dismiss}>
                <FormattedMessage {...messages.dismiss} />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}
