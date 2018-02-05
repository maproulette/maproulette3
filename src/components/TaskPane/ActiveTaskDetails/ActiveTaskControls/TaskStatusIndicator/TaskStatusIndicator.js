import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { messagesByStatus }
       from '../../../../../services/Task/TaskStatus/TaskStatus'
import WithDeactivateOnOutsideClick
       from '../../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import Popout from '../../../../Bulma/Popout'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './TaskStatusIndicator.css'

const DeactivatablePopout = WithDeactivateOnOutsideClick(Popout)

/**
 * TaskStatusIndicator displays the current status of the given task.
 * If isMinimized is set to true, then it makes use of a popout component
 * with an icon control.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskStatusIndicator extends Component {
  render() {
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
            </div>
          </div>
        </div>
      )
    }
  }
}

TaskStatusIndicator.propTypes = {
  task: PropTypes.object.isRequired,
  isMinimized: PropTypes.bool,
}
