import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from '../../Bulma/Modal'
import { FormattedMessage, injectIntl } from 'react-intl'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './AboutModal.css'

/**
 * AboutModal displays a modal dialogue with a brief description of the app, version
 * Clicking the button (or off the modal) takes the user to the root of the app.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AboutModal extends Component {
  finishModal = () => {
    // If we were popped up by a user action (the /about route was pushed),
    // then take the user back to where they were if we can, otherwise go home.
    //
    // If we were just popped up on top of another route, then it's up to
    // onDismiss to remove the modal.
    this.props.onDismiss && this.props.onDismiss()

    if (this.props.location.pathname === '/about') {
      this.props.history.action === "PUSH" ?
      this.props.history.goBack() :
      this.props.history.push('/')
    }
  }

  render() {
    const version = `v${process.env.REACT_APP_VERSION_SEMVER}`
    return (
      <Modal className='about-modal'
             isActive={true}
             onClose={this.finishModal}>
        <div className='about-modal__content'>
          <div className='columns'>
            <div className='column is-centered is-mobile about-modal__feedback-note'>
              <MarkdownContent markdown={this.props.intl.formatMessage(messages.feedbackInfo)} />
            </div>
          </div>

          <div className='columns is-centered is-mobile'>
            <div className='column is-narrow'>
              <SvgSymbol viewBox='0 0 20 20' sym="about-icon" className="about-modal__icon"/>
            </div>
          </div>

          <div className='columns'>
            <div className='column is-centered is-mobile'>
              <h1 className='title is-2'>
                <FormattedMessage {...messages.header} />
              </h1>
            </div>
          </div>

          <div className='about-modal__intro'>
            <ul className='about-modal__feature-points'>
              <li>
                <FormattedMessage {...messages.filterTagIntro}/>
              </li>

              <li>
                <FormattedMessage {...messages.filterLocationIntro} />
              </li>

              <li>
                <FormattedMessage {...messages.filterDifficultyIntro} />
              </li>

              <li>
                <FormattedMessage {...messages.createChallenges} />
              </li>
            </ul>
          </div>

          <div className='columns is-centered is-mobile'>
            <div className='column is-narrow'>
              <button className='button is-primary is-outlined about-modal__view-challenges'
                      onClick={this.finishModal}>
                <FormattedMessage {...messages.subheader} />
              </button>
            </div>
          </div>

          <div className='about-modal__footer'>
            <p>
              MapRoulette <a target="_blank" href={
                `${process.env.REACT_APP_GIT_REPOSITORY_URL}/releases/tag/${version}`
              }>
                {version}
              </a>
            </p>
          </div>
        </div>
      </Modal>
    )
  }
}

AboutModal.propTypes = {
  /** router history */
  history: PropTypes.object.isRequired,
  onDismiss: PropTypes.func,
}

export default injectIntl(AboutModal)
