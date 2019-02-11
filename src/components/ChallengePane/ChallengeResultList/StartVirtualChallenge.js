import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _isObject from 'lodash/isObject'
import QuickTextBox from '../../QuickTextBox/QuickTextBox'
import SignInButton from '../../SignInButton/SignInButton'
import BusySpinner from '../../BusySpinner/BusySpinner'
import messages from './Messages'

/**
 * StartVirtualChallenge renders a control for initiating creation of
 * a new virtual challenge. When clicked, the user will be asked for
 * the name of their new virtual challenge, and then cration will be
 * initiated.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class StartVirtualChallenge extends Component {
  state = {
    /** Determines whether to show the name input */
    editingName: false,
    /** Current value of name input */
    challengeName: '',
  }

  /** Invoked to display the virtual challenge name input field */
  startEditing = () => this.setState({editingName: true, challengeName: ''})

  /** Updates the current value of the challenge name */
  setChallengeName = challengeName => this.setState({challengeName})

  /** Invoked to successfully complete editing of the name */
  finishEditing = () => {
    this.props.createVirtualChallenge(this.state.challengeName)
    this.setState({editingName: false, challengeName: ''})
  }

  /** Invoked to cancel editing of the name */
  cancelEditing = () => this.setState({editingName: false, challengeName: ''})

  render() {
    let creationStep = null
    if (this.props.creatingVirtualChallenge) {
      creationStep = <BusySpinner />
    }
    else if (this.state.editingName) {
      if (!_isObject(this.props.user)) {
        creationStep = <SignInButton {...this.props} longForm className="mr-w-full" />
      }
      else {
        creationStep =
          <QuickTextBox text={this.state.challengeName}
                        setText={this.setChallengeName}
                        done={this.finishEditing}
                        cancel={this.cancelEditing}
                        placeholder={this.props.intl.formatMessage(
                          messages.virtualChallengeNameLabel
                        )} />
      }
    }
    else {
      creationStep = (
        <button
          className={classNames("mr-button mr-w-full", {
            "is-loading": this.props.creatingVirtualChallenge
          })}
          onClick={this.startEditing}
        >
          <FormattedMessage {...messages.createVirtualChallenge}
                            values={{taskCount: this.props.taskCount}}/>
        </button>
      )
    }

    return <div className="mr-mb-4 mr-w-full">{creationStep}</div>
  }
}

StartVirtualChallenge.propTypes = {
  /** Invoked to create the virtual challenge */
  createVirtualChallenge: PropTypes.func.isRequired,
  /** Set to true if the virtual challenge is in process of being created */
  creatingVirtualChallenge: PropTypes.bool,
}

StartVirtualChallenge.defaultProps = {
  creatingVirtualChallenge: false,
}

export default injectIntl(StartVirtualChallenge)
