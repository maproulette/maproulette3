import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { messagesByStatus,
         TaskStatus } from '../../../../services/Task/TaskStatus/TaskStatus'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import Popout from '../../../Bulma/Popout'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './TaskStatusIndicator.css'

const DeactivatablePopout = WithDeactivateOnOutsideClick(Popout)

/**
 * TaskStatusIndicator displays the current status of the given task. If
 * isMinimized is set to true, then it makes use of a popout component with an
 * icon control.
 *
 * By default, the indicator only renders for statuses other than created. Set
 * the allStatuses prop to true to render regardless of status.
 *
 * If an OSM changeset is associated with the task, then a link to view the
 * changeset will also be displayed alongside the task status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskStatusIndicator extends Component {
  render() {
    if (this.props.task.status === TaskStatus.created &&
        !this.props.allStatuses) {
      return null
    }

    if (this.props.isMinimized) {
      const popoutButton = (
        <button className="button icon-only task-status">
          <span className="control-icon"
                title={this.props.intl.formatMessage(messages.statusTooltip)}>
            <SvgSymbol viewBox='0 0 20 20' sym="flag-icon" />
          </span>
        </button>
      )

      return (
        <DeactivatablePopout direction='right'
                             className='task-status-popout'
                             control={popoutButton}>
          <div className="popout-content__header active-task-details--bordered">
            <h3 className="info-popout--name">
              <FormattedMessage {...messages.statusPrompt} />
            </h3>
          </div>

          <div className="popout-content__body">
            <span className="task-status__label">
              <FormattedMessage {...messagesByStatus[this.props.task.status]} />
            </span>
          </div>
        </DeactivatablePopout>
      )
    }
    else {
      return (
        <div className={classNames("task-status",
                                   "active-task-controls__vertical-control-block",
                                   "active-task-details--bordered",
                                   this.props.className)}>
          <div className="active-task-details--sub-heading">
            <FormattedMessage {...messages.statusPrompt} />
          </div>
          <div>
            <div className="task-status__label">
              <FormattedMessage {...messagesByStatus[this.props.task.status]} />

              {this.props.task.changesetId > 0 &&
               <a href={`https://www.openstreetmap.org/changeset/${this.props.task.changesetId}`}
                 target="_blank"
                 className="task-status__view-changeset-link">
                 <FormattedMessage {...messages.viewChangeset} />
               </a>
              }
            </div>
          </div>
        </div>
      )
    }
  }
}

TaskStatusIndicator.propTypes = {
  /** The task for which status is to be displayed */
  task: PropTypes.object.isRequired,
  /** Set to true to render in minimized mode */
  isMinimized: PropTypes.bool,
  /** Set to true to render regardless of task status. */
  allStatuses: PropTypes.bool,
}

TaskStatusIndicator.defaultProps = {
  isMinimized: false,
  allStatuses: false,
}
