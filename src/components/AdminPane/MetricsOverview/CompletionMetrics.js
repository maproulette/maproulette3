import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabeledProgressBar from '../../Bulma/LabeledProgressBar'
import _map from 'lodash/map'
import _values from 'lodash/values'
import _sum from 'lodash/sum'
import _startCase from 'lodash/startCase'
import _pick from 'lodash/pick'

export default class CompletionMetrics extends Component {
  render() {
    const completionStatusMetrics = 
      _pick(this.props.taskMetrics,
            ['fixed', 'falsePositive', 'alreadyFixed', 'skipped', 'tooHard'])

    const totalCompleted = _sum(_values(completionStatusMetrics))

    let statusProgressBars = null
    if (!this.props.onlyCompleted) {
      statusProgressBars = _map(completionStatusMetrics,
        (value, label) =>
          <LabeledProgressBar className='completion-progress'
                              key={label} label={_startCase(label)}
                              value={value} max={this.props.taskMetrics.total} />
      )
    }

    return (
      <div className="completion-stats">
        <LabeledProgressBar className='completion-progress'
                            key="total-completed" label="Tasks Completed"
                            value={totalCompleted} max={this.props.taskMetrics.total} />
        {!this.props.onlyCompleted && <div>{statusProgressBars}</div>}
      </div>
    )
  }
}

CompletionMetrics.propTypes = {
  taskMetrics: PropTypes.object.isRequired,
}
