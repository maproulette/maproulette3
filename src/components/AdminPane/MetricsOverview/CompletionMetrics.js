import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { TaskStatus, keysByStatus }
       from '../../../services/Task/TaskStatus/TaskStatus'
import LabeledProgressBar from '../../Bulma/LabeledProgressBar'
import _values from 'lodash/values'
import _sum from 'lodash/sum'
import _pick from 'lodash/pick'
import messages from './Messages'

export class CompletionMetrics extends Component {
  render() {
    const evaluatedStatusMetrics = _pick(this.props.taskMetrics, [
      keysByStatus[TaskStatus.falsePositive],
      keysByStatus[TaskStatus.tooHard],
      keysByStatus[TaskStatus.skipped],
      keysByStatus[TaskStatus.alreadyFixed],
      keysByStatus[TaskStatus.fixed],
    ])

    const totalEvaluated = _sum(_values(evaluatedStatusMetrics))

    return (
      <div className="completion-stats">
        <LabeledProgressBar className='completion-progress evaluated-by-user'
                            key="total-completed"
                            label={this.props.intl.formatMessage(messages.evaluatedLabel)}
                            value={totalEvaluated}
                            max={this.props.taskMetrics.total} />
      </div>
    )
  }
}

CompletionMetrics.propTypes = {
  taskMetrics: PropTypes.object.isRequired,
}

export default injectIntl(CompletionMetrics)
