import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import _noop from 'lodash/noop'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _isArray from 'lodash/isArray'
import AsManager from '../../interactions/User/AsManager'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import TriStateCheckbox from '../Bulma/TriStateCheckbox'
import ConfirmAction from '../ConfirmAction/ConfirmAction'
import DropdownButton from '../Bulma/DropdownButton'
import WithDeactivateOnOutsideClick from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import { TaskStatus, statusLabels, keysByStatus } from '../../services/Task/TaskStatus/TaskStatus'
import { TaskReviewStatusWithUnset, reviewStatusLabels, keysByReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskPriority, taskPriorityLabels, keysByPriority } from '../../services/Task/TaskPriority/TaskPriority'
import { buildLinkToExportCSV, buildLinkToExportGeoJSON } from '../../services/Challenge/Challenge'
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
                                <div className="basic-dropdown-indicator mr-top-0" />
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
                                      <div>
                                          <button className={classNames("mr-text-current mr-pr-1",
                                                              (!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()) ? "mr-text-grey mr-cursor-default" : "")}
                                                  disabled={!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()}>
                                              <FormattedMessage {...messages.changeStatusToLabel} />
                                          </button>
                                          {(!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()) &&
                                            <span className="mr-text-current mr-text-grey">...</span>}
                                          {(this.props.someTasksAreSelected() || this.props.allTasksAreSelected()) &&
                                            <ConfirmAction
                                              action="onChange"
                                              skipConfirmation={e => e.target.value === ""}
                                            >
                                              <select
                                                onChange={e => { if (e.target.value !== "") this.props.changeStatus(e.target.value) }}
                                                defaultValue={this.state.statusChange}
                                                className="select mr-min-w-20 mr-bg-grey-lighter mr-rounded mr-px-1 mr-text-xs mr-pl-2"
                                              >
                                                <option key="choose" value="">
                                                  {this.props.intl.formatMessage(messages.chooseStatusLabel)}
                                                </option>
                                                {_map(_omit(TaskStatus, "deleted"), (value, key) =>
                                                  <option key={key} value={value}>
                                                    {localizedStatusLabels[key]}
                                                  </option>
                                                )}
                                              </select>
                                            </ConfirmAction>
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
                                <form method="post" action={buildLinkToExportCSV(_get(this.props, 'challenge.id'), this.props.criteria)}>
                                  <input type="hidden" name="taskPropertySearch"
                                      value={JSON.stringify(_get(this.props, 'criteria.filters.taskPropertySearch', {}))}
                                  />
                                  <button type="submit" className="mr-text-green-lighter mr-bg-transparent mr-align-top mr-pb-2">
                                    <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                                    <FormattedMessage {...messages.exportCSVLabel} />
                                  </button>
                                </form>
                              </li>
                            </ul>
                            <ul className="mr-list-dropdown">
                              <li>
                                <form method="post" action={buildLinkToExportGeoJSON(_get(this.props, 'challenge.id'), this.props.criteria)}>
                                  <input type="hidden" name="taskPropertySearch"
                                      value={JSON.stringify(_get(this.props, 'criteria.filters.taskPropertySearch', {}))}
                                  />
                                  <button type="submit" className="mr-text-green-lighter mr-bg-transparent mr-align-top">
                                    <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                                    <FormattedMessage {...messages.exportGeoJSONLabel} />
                                  </button>
                                </form>
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
