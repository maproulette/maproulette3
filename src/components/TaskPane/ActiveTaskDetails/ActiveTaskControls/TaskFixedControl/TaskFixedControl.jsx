import { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { TaskStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import Button from '../../../../Button/Button'
import messages from './Messages'

/**
 * TaskFixedControl displays a control for marking a task with a fixed status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskFixedControl extends Component {
  render() {
    if (this.props.asLink) {
      return (
        <a onClick={() => this.props.complete(TaskStatus.fixed)}>
          {this.props.fixedLabel ? this.props.fixedLabel :
           <FormattedMessage {...messages.fixedLabel} />
          }
        </a>
      )
    }
    else {
      return (
        <Button
          className="mr-button--blue-fill mr-mb-2 mr-mr-2"
          style={{ minWidth: '10rem'}}
          onClick={() => this.props.complete(TaskStatus.fixed)}
        >
          {this.props.fixedLabel ? this.props.fixedLabel :
           <FormattedMessage {...messages.fixedLabel} />
          }
        </Button>
      )
    }
  }
}

TaskFixedControl.propTypes = {
  /** Invoked to mark the task as already-fixed */
  complete: PropTypes.func.isRequired,
}
