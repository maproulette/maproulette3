import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import Modal from '../Bulma/Modal'
import _noop from 'lodash/noop'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _join from 'lodash/join'
import _each from 'lodash/each'
import _omit from 'lodash/omit'
import _isArray from 'lodash/isArray'
import AsManager from '../../interactions/User/AsManager'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import TriStateCheckbox from '../Bulma/TriStateCheckbox'
import confirmMessages from '../ConfirmAction/Messages'
import DropdownButton from '../Bulma/DropdownButton'
import WithDeactivateOnOutsideClick from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import { TaskStatus, statusLabels, keysByStatus } from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatusWithUnset, reviewStatusLabels, keysByReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskPriority, taskPriorityLabels, keysByPriority } from '../../services/Task/TaskPriority/TaskPriority'
import messages from './Messages'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * TaskAnalysisTableHeader renders a header for the task analysis table.
 *
 * @author [Ryan Scherler](https://github.com/ryanscherler)
 */
export class TaskAnalysisTableHeader extends Component {
    state = {}

    takeTaskSelectionAction = action => {
        if (action.statusAction) {
          this.props.selectTasksWithStatus(action.status)
        }
        else if (action.priorityAction) {
          this.props.selectTasksWithPriority(action.priority)
        }
        else if (action.shownAction) {
          this.props.selectTasks(this.props.taskInfo.tasks)
        }
    }

    render() {
        const {countShown, configureColumns} = this.props
        const selectedCount = this.props.selectedTasks.size
        const totalTaskCount = _get(this.props, 'totalTaskCount') || countShown || 0
        const totalTasksInChallenge = _get(this.props, 'totalTasksInChallenge', 0)
        const percentShown = Math.round(totalTaskCount / totalTasksInChallenge * 100.0)
        const manager = AsManager(this.props.user)
        const localizedStatusLabels = statusLabels(this.props.intl)
        const localizedReviewStatusLabels = reviewStatusLabels(this.props.intl)
        const localizedPriorityLabels = taskPriorityLabels(this.props.intl)

        let taskStatusQuery = []
        _each(this.props.includeTaskStatuses, (include, status) => {
          if (include) taskStatusQuery.push(status)
        })
        let taskPriorityQuery = []
        _each(this.props.includeTaskPriorities, (include, priority) => {
          if (include) taskPriorityQuery.push(priority)
        })
        let taskReviewStatusQuery = []
        _each(this.props.includeTaskReviewStatuses, (include, reviewStatus) => {
          if (include) taskReviewStatusQuery.push(reviewStatus)
        })
        const queryFilters = `status=${_join(taskStatusQuery, ',')}&` +
                             `priority=${_join(taskPriorityQuery, ',')}&` +
                             `reviewStatus=${_join(taskReviewStatusQuery, ',')}`


        const taskSelectionStatuses = _isArray(this.props.taskSelectionStatuses) ?
                                      this.props.taskSelectionStatuses :
                                      TaskStatus

        const taskSelectionReviewStatuses = _isArray(this.props.taskSelectionReviewStatuses) ?
                                            this.props.taskSelectionReviewStatuses :
                                            TaskReviewStatusWithUnset

        const taskSelectionPriorities = _isArray(this.props.taskSelectionPriorities) ?
                                        this.props.taskSelectionPriorities :
                                        TaskPriority

        const taskSelectionActions = [{
          key: 'shown-tasks',
          text: this.props.intl.formatMessage(messages.shownLabel),
          shownAction: true,
        }].concat(
          _map(taskSelectionStatuses, status => ({
            key: `status-${status}`,
            text: localizedStatusLabels[keysByStatus[status]],
            status,
            statusAction: true,
          }))
        ).concat(
          _map(taskSelectionReviewStatuses, status => ({
            key: `review-status-${status}`,
            text: localizedReviewStatusLabels[keysByReviewStatus[status]],
            status,
            statusAction: true,
          }))
        ).concat(
          _map(taskSelectionPriorities, priority => ({
            key: `priority-${priority}`,
            text: `${localizedPriorityLabels[keysByPriority[priority]]} ${this.props.intl.formatMessage(messages.priorityLabel)}`,
            priority,
            priorityAction: true,
          }))
        )


        const confirmModal =
          <div className="confirm-action">
            <Modal className="confirm-action__modal" onClose={() => this.setState({showConfirm: false})} isActive={true}>
              <article className="message">
                <div className="message-header mr-bg-blue-dark">
                  <FormattedMessage {...confirmMessages.title} />
                </div>
                <div className="message-body">
                  <div className="confirm-action__prompt mr-text-blue-dark">
                    <FormattedMessage {...confirmMessages.prompt} />
                  </div>

                  <div className="confirm-action__controls">
                    <button className="mr-button mr-button--blue"
                            onClick={() => this.setState({showConfirm: false})}>
                      <FormattedMessage {...confirmMessages.cancel} />
                    </button>

                    <button className="mr-button mr-button--danger mr-ml-4"
                            onClick={() => {
                              this.props.changeStatus(this.state.statusChange)
                              this.setState({showConfirm: false})
                            }}>
                      <FormattedMessage {...confirmMessages.proceed} />
                    </button>
                  </div>
                </div>
              </article>
            </Modal>
          </div>

        return (
            <div className="mr-flex mr-justify-between">
                <div className="mr-flex mr-items-center">
                    {_get(this.props, 'taskInfo.tasks.length', 0) > 0 &&
                        <div className="admin__manage-tasks__task-controls mr-mr-4">
                            <div className="admin__manage-tasks__task-controls__selection mr-m-0 mr-flex mr-pb-2 mr-pt-1 mr-items-baseline"
                                    title={this.props.intl.formatMessage(messages.bulkSelectionTooltip)}>
                                <label className="checkbox mr-mb-0">
                                <TriStateCheckbox
                                    checked={this.props.allTasksAreSelected()}
                                    indeterminate={this.props.someTasksAreSelected()}
                                    onClick={() => this.props.toggleAllTasksSelection()}
                                    onChange={_noop}
                                />
                                </label>
                                <DeactivatableDropdownButton options={taskSelectionActions}
                                                                onSelect={this.takeTaskSelectionAction}>
                                <div className="basic-dropdown-indicator mr-pin-t" />
                                </DeactivatableDropdownButton>
                            </div>
                        </div>
                    }

                    <h2 className="mr-flex mr-items-center mr-w-full mr-text-md mr-uppercase mr-text-grey">
                        <span className="mr-mr-2">
                          <FormattedMessage
                            {...messages.taskCountSelectedStatus}
                            values={{selectedCount}}
                          />
                        </span>
                        <span className="mr-mr-6">
                          {this.props.customHeaderControls}
                        </span>

                        {totalTaskCount < 1 ? <FormattedMessage {...messages.taskCountShownStatus} values={{countShown: totalTaskCount}} /> :
                        <FormattedMessage {...messages.taskPercentShownStatus}
                            values={{
                                percentShown,
                                countShown: totalTaskCount,
                                countTotal: totalTasksInChallenge,
                            }} />}
                    </h2>
                </div>

                {!this.props.suppressManagement &&
                <Dropdown className="mr-dropdown--right"
                    dropdownButton={dropdown => (
                        <button onClick={dropdown.toggleDropdownVisible} className="mr-flex mr-items-center mr-text-green-light">
                            <SvgSymbol sym="cog-icon"
                                viewBox="0 0 20 20"
                                className="mr-fill-current mr-w-5 mr-h-5" />
                        </button>
                    )}
                    dropdownContent={() =>
                        <React.Fragment>
                            <ul className="mr-list-dropdown">
                                {manager.canWriteProject(this.props.challenge.parent) &&
                                    <li>
                                      {this.state.showConfirm && confirmModal}
                                      <div>
                                          <button className={classNames("mr-text-current mr-pr-1",
                                                              (!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()) ? "mr-text-grey mr-cursor-default" : "")}
                                                  disabled={!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()}>
                                              <FormattedMessage {...messages.changeStatusToLabel} />
                                          </button>
                                          {(!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()) &&
                                            <span className="mr-text-current mr-text-grey">...</span>}
                                          {(this.props.someTasksAreSelected() || this.props.allTasksAreSelected()) &&
                                            <select onChange={e => { if (e.target.value !== "") {
                                                                      this.setState({statusChange: e.target.value, showConfirm: true})
                                                                    }}}
                                                    defaultValue={this.state.statusChange}
                                                    className="select mr-min-w-20 mr-bg-grey-lighter mr-rounded mr-px-1 mr-text-xs mr-pl-2">
                                              <option key="choose" value="">
                                                {this.props.intl.formatMessage(messages.chooseStatusLabel)}
                                              </option>
                                              {_map(_omit(TaskStatus, "deleted"), (value, key) =>
                                                <option key={key} value={value}>
                                                  {localizedStatusLabels[key]}
                                                </option>
                                              )}
                                            </select>
                                          }
                                      </div>
                                    </li>
                                }
                                <li>
                                    <button className="mr-text-current"
                                            onClick={() => configureColumns()}>
                                        <FormattedMessage {...messages.configureColumnsLabel} />
                                    </button>
                                </li>
                            </ul>
                            <hr className="mr-rule-dropdown" />
                            <ul className="mr-list-dropdown">
                              <li>
                                <a target="_blank"
                                    rel="noopener noreferrer"
                                    href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/challenge/${_get(this.props, 'challenge.id')}/tasks/extract?${queryFilters}`}
                                    className="mr-flex mr-items-center"
                                >
                                    <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                                    <FormattedMessage {...messages.exportCSVLabel} />
                                </a>
                              </li>
                            </ul>
                            <ul className="mr-list-dropdown">
                                <li>
                                  <a target="_blank"
                                      rel="noopener noreferrer"
                                      href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/challenge/view/${_get(this.props, 'challenge.id')}?${queryFilters}`}
                                      className="mr-flex mr-items-center"
                                   >
                                     <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                                     <FormattedMessage {...messages.exportGeoJSONLabel} />
                                   </a>
                                </li>
                            </ul>
                        </React.Fragment>
                    }
                />
                }
            </div>
        )
    }
}

TaskAnalysisTableHeader.propTypes = {
    countShown: PropTypes.number.isRequired,
    configureColumns: PropTypes.func.isRequired,
}

export default injectIntl(TaskAnalysisTableHeader)
