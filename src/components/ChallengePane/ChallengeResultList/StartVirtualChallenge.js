import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import QuickTextBox from '../../QuickTextBox/QuickTextBox'
import messages from './Messages'

export default class StartVirtualChallenge extends Component {
  state = {
    editingName: false,
    challengeName: null,
  }

  startEditing = () => this.setState({editingName: true, challengeName: null})

  setChallengeName = challengeName => this.setState({challengeName})

  finishEditing = () => {
    this.props.startMapBoundedTasks(this.state.challengeName)
    this.setState({editingName: false, challengeName: null})
  }

  cancelEditing = () => this.setState({editingName: false, challengeName: null})

  render() {
    let creationStep = null
    if (this.state.editingName) {
      creationStep =
        <QuickTextBox text={this.state.challengeName}
                      setText={this.setChallengeName}
                      done={this.finishEditing}
                      cancel={this.cancelEditing}
                      placeholder='Name for your "virtual" challenge' />
    }
    else {
      creationStep =
        <button className={classNames(
                  "button is-outlined is-primary",
                  {"is-loading": this.props.creatingVirtualChallenge}
                )}
                onClick={this.startEditing}>
          <FormattedMessage {...messages.createVirtualChallenge} />
        </button>
    }
    return (
      <div className="challenge-result-list__virtual-challenge-option">
        {creationStep}
      </div>
    )
  }
}

StartVirtualChallenge.propTypes = {
  startMapBoundedTasks: PropTypes.func.isRequired,
  creatingVirtualChallenge: PropTypes.bool,
}

StartVirtualChallenge.defaultProps = {
  creatingVirtualChallenge: false,
}
