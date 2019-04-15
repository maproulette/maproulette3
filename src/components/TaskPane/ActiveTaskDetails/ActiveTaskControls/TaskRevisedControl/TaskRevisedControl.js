import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import { TaskReviewStatus }
       from '../../../../../services/Task/TaskReview/TaskReviewStatus'
import Dropdown from '../../../../Dropdown/Dropdown'
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
        <Dropdown
          className={classNames("mr-dropdown--fixed mr-w-full", this.props.className)}
          dropdownButton={dropdown =>
            <MoreOptionsButton toggleDropdownVisible={dropdown.toggleDropdownVisible} {...this.props}/>
          }
          dropdownContent={dropdown =>
            <ListMoreOptionsItems {...this.props} />
          }
        />
      )
    }
  }
}

const MoreOptionsButton = function(props) {
  return (
    <button
      className="mr-dropdown__button mr-button mr-text-green-lighter mr-w-full"
      onClick={props.toggleDropdownVisible}
    >
      {props.intl.formatMessage(messages.revisedLabel)}&hellip;
    </button>
  )
}

const ListMoreOptionsItems = function(props) {
  return (
    <ol className="mr-list-dropdown">
     <li>
       {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
       <a className=""
         onClick={() => props.complete(props.task.status, TaskReviewStatus.needed)}
       >
         <FormattedMessage {...messages.resubmit} />
       </a>
     </li>
     <li>
       {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
       <a className=""
         onClick={() => props.complete(props.task.status, TaskReviewStatus.disputed)}
       >
         <FormattedMessage {...messages.dispute} />
       </a>
     </li>
    </ol>
  )
}

TaskRevisedControl.propTypes = {
  /** Invoked to mark the task as revised */
  complete: PropTypes.func.isRequired,
}
