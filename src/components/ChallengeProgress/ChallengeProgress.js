import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { sum as _sum,
         values as _values,
         omit as _omit,
         isObject as _isObject,
         get as _get } from 'lodash'
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
                               label='Task Progress'
                               value={completedTasks}
                               max={taskActions.total} />
  }
}

ChallengeProgress.propTypes = {
  challenge: PropTypes.object,
}
