import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _sum from 'lodash/sum'
import _values from 'lodash/values'
import _omit from 'lodash/omit'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import LabeledProgressBar from '../Bulma/LabeledProgressBar'
import './ChallengeProgress.css'

export default class ChallengeProgress extends Component {
  render() {
    const taskActions = _get(this.props, 'challenge.actions')
    if (!_isObject(taskActions)) {
      return null
    }

    const completedTasks = _sum(_values(_omit(taskActions, ['total', 'available'])))
    return <LabeledProgressBar className="challenge-task-progress"
                               isMedium
                               label='Task Progress'
                               value={completedTasks}
                               max={taskActions.total} />
  }
}

ChallengeProgress.propTypes = {
  challenge: PropTypes.object,
}
