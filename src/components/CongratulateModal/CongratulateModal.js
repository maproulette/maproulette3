import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Confetti from 'react-dom-confetti'
import Modal from '../Bulma/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './CongratulateModal.scss'

/**
 * CongratulateModal presents a celebratory modal that displays a
 * congratulatory message along with a confetti cannon visual effect
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CongratulateModal extends Component {
  state = {
    confetti: false,
    active: true,
  }

  dismiss = () => this.setState({active: false})

  componentDidMount() {
    setTimeout(() => this.setState({confetti: true}), 1000)
  }

  render() {
    return (
      <Modal
        className="congratulate-modal"
        contentClassName="mr-bg-blue-dark"
        onClose={this.dismiss}
        isActive={this.state.active}
      >
        <div className="has-svg-icon congratulate-modal__close-control"
             aria-label="close"
             onClick={this.dismiss}>
          <SvgSymbol sym="outline-close-icon" viewBox="0 0 20 20" />
        </div>

        <div className="congratulate-modal__content mr-bg-blue-dark mr-text-white">
          <div className="congratulate-modal__message">
            <SvgSymbol sym="trophy-icon" viewBox="0 0 20 20"
                       className="congratulate-modal__message__trophy" />
            <h2><FormattedMessage {...messages.header} /></h2>
            <p><FormattedMessage {...messages.primaryMessage} /></p>
            <Confetti className="congratulate-modal__confetti" active={this.state.confetti} />
            <button className="mr-button mr-mt-8" onClick={this.dismiss}>
              <FormattedMessage {...messages.dismiss} />
            </button>
          </div>
        </div>
      </Modal>
    )
  }
}
