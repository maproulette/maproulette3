import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _pick from 'lodash/pick'
import { TaskReviewStatus }
       from '../../../../../services/Task/TaskReview/TaskReviewStatus'
import Button from '../../../../Button/Button'
import messages from './Messages'

/**
 * TaskRevisedControl displays a control for marking a task as revision complete.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskRevisedControl extends Component {
  render() {
    if (this.props.asLink) {
      return (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a onClick={() => this.props.complete(TaskReviewStatus.needed)}>
          <FormattedMessage {...messages.revisedLabel} />
        </a>
      )
    }
    else {
      return (
        <Button
          className="mr-button--blue-fill"
          onClick={() => this.props.complete(this.props.task.status, true)}
        >
          <FormattedMessage {...messages.revisedLabel} />
        </Button>
      )
    }
  }
}

TaskRevisedControl.propTypes = {
  /** Invoked to mark the task as revised */
  complete: PropTypes.func.isRequired,
}
