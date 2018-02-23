import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { TaskStatus,
         statusLabels }
       from '../../../services/Task/TaskStatus/TaskStatus'
import LabeledProgressBar from '../../Bulma/LabeledProgressBar'
import _map from 'lodash/map'
import _values from 'lodash/values'
import _sum from 'lodash/sum'
import _pick from 'lodash/pick'
import _keys from 'lodash/keys'
import messages from './Messages'

export class CompletionMetrics extends Component {
  render() {
    const allStatusMetrics =
      _pick(this.props.taskMetrics, _keys(TaskStatus))

    const evaluatedStatusMetrics =
      _pick(this.props.taskMetrics,
            ['fixed', 'falsePositive', 'alreadyFixed', 'skipped', 'tooHard'])

    const localizedStatusLabels = statusLabels(this.props.intl)
    const totalEvaluated = _sum(_values(evaluatedStatusMetrics))

    let statusProgressBars = null
    if (!this.props.onlyCompleted) {
      statusProgressBars = _map(allStatusMetrics,
        (value, statusName) =>
          <LabeledProgressBar className='completion-progress'
                              key={statusName}
                              label={localizedStatusLabels[statusName]}
                              value={value}
                              max={this.props.taskMetrics.total} />
      )
    }

    return (
      <div className="completion-stats">
        <LabeledProgressBar className='completion-progress'
                            key="total-completed"
                            label={this.props.intl.formatMessage(messages.evaluatedLabel)}
                            value={totalEvaluated}
                            max={this.props.taskMetrics.total} />
        {!this.props.onlyCompleted && <div>{statusProgressBars}</div>}
      </div>
    )
  }
}

CompletionMetrics.propTypes = {
  taskMetrics: PropTypes.object.isRequired,
}

export default injectIntl(CompletionMetrics)
