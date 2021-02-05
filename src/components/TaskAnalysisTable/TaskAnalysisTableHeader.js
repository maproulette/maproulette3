import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import _noop from 'lodash/noop'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import AsManager from '../../interactions/User/AsManager'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import TriStateCheckbox from '../Bulma/TriStateCheckbox'
import ConfirmAction from '../ConfirmAction/ConfirmAction'
import TimezonePicker from '../TimezonePicker/TimezonePicker'
import WithSavedFilters from '../HOCs/WithSavedFilters/WithSavedFilters'
import SavedFiltersList from '../SavedFilters/SavedFiltersList'
import ManageSavedFilters from '../SavedFilters/ManageSavedFilters'
import { TaskStatus, statusLabels } from '../../services/Task/TaskStatus/TaskStatus'
import { buildLinkToMapperExportCSV,
         buildLinkToReviewerMetaExportCSV } from '../../services/Task/TaskReview/TaskReview'
import { buildLinkToExportCSV, buildLinkToExportGeoJSON } from '../../services/Challenge/Challenge'
import messages from './Messages'

/**
 * TaskAnalysisTableHeader renders a header for the task analysis table.
 *
 * @author [Ryan Scherler](https://github.com/ryanscherler)
 */
export class TaskAnalysisTableHeader extends Component {
  state = {}

  render() {
    const {countShown, configureColumns} = this.props

    const totalTaskCount = _get(this.props, 'totalTaskCount') || countShown || 0
    const totalTasksInChallenge = _get(this.props, 'totalTasksInChallenge', 0)
    const percentShown =
      totalTasksInChallenge > 0 ?
      Math.round(totalTaskCount / totalTasksInChallenge * 100.0) :
      0
    const manager = AsManager(this.props.user)
    const localizedStatusLabels = statusLabels(this.props.intl)

    return (
      <div className="mr-flex mr-justify-between">
        <div className="mr-flex mr-items-center">
          {_get(this.props, 'taskInfo.tasks.length', 0) > 0 &&
              <div className="mr-mr-4 mr-ml-12.8">
                {!this.props.suppressTriState &&
                 <div title={this.props.intl.formatMessage(messages.bulkSelectionTooltip)}>
                   <TriStateCheckbox
                       checked={this.props.allTasksAreSelected(totalTaskCount)}
                       indeterminate={this.props.someTasksAreSelected(totalTaskCount)}
                       onClick={() => this.props.toggleAllTasksSelection()}
                       onChange={_noop}
                   />
                 </div>
                }
              </div>
          }

          <h2 className="mr-flex mr-items-center mr-w-full mr-text-md mr-uppercase mr-text-white">
            <span className="mr-mr-2">
              <FormattedMessage
                {...messages.taskCountSelectedStatus}
                values={{selectedCount: this.props.selectedTaskCount(totalTaskCount)}}
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
          <React.Fragment>
            <ManageSavedFilters {...this.props}
              searchFilters={this.props.criteria}
            />
            <div className="mr-flex mr-justify-start">
              <Dropdown className="mr-dropdown--right" key="filter-dropdown"
                dropdownButton={dropdown => (
                  <button onClick={dropdown.toggleDropdownVisible}
                    className="mr-text-green-lighter mr-mr-4">
                  <SvgSymbol
                    sym="filter-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-5 mr-h-5" />
                  </button>
                )}
                dropdownContent={dropdown =>
                  <React.Fragment>
                    <ul className="mr-list-dropdown">
                      <SavedFiltersList
                        searchFilters={this.props.criteria}
                        afterClick={dropdown.toggleDropdownVisible}
                        {...this.props}
                      />
                    </ul>
                  </React.Fragment>
                }
              />
              <Dropdown className="mr-dropdown--right" key="gear-dropdown"
                dropdownButton={dropdown => (
                  <button onClick={dropdown.toggleDropdownVisible}
                    className="mr-text-green-lighter">
                    <SvgSymbol sym="cog-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5" />
                  </button>
                )}
                dropdownContent={dropdown =>
                  <React.Fragment>
                    <ul className="mr-list-dropdown">
                      {manager.canWriteProject(this.props.challenge.parent) &&
                        <li>
                          <div>
                            <button
                              className={classNames("mr-text-current mr-pr-1",
                                (!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()) ? "mr-text-grey-light mr-cursor-default" : "mr-text-green-lighter"
                              )}
                              disabled={!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()}
                            >
                              <FormattedMessage {...messages.changeStatusToLabel} />
                            </button>
                            {(!this.props.someTasksAreSelected() && !this.props.allTasksAreSelected()) &&
                              <span className="mr-text-current mr-text-grey-light">...</span>
                            }
                            {(this.props.someTasksAreSelected() || this.props.allTasksAreSelected()) &&
                              <ConfirmAction
                                action="onChange"
                                skipConfirmation={e => e.target.value === ""}
                              >
                                <select
                                  onChange={e => { if (e.target.value !== "") this.props.changeStatus(this.props.selectedTasks, e.target.value) }}
                                  defaultValue={this.state.statusChange}
                                  className="mr-min-w-20 mr-select mr-text-xs">
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
                      {manager.canWriteProject(this.props.challenge.parent) &&
                        <li>
                          <div>
                            <ConfirmAction
                              action="onClick"
                              skipConfirmation={e => e.target.value === ""}>
                              <button
                                className="mr-text-current mr-pr-1 mr-text-green-lighter"
                                onClick={() => this.props.removeReviewRequests(this.props.selectedTasks)}
                              >
                                <FormattedMessage {...messages.changeReviewStatusLabel} />
                              </button>
                            </ConfirmAction>
                          </div>
                        </li>
                      }
                      {manager.canWriteProject(this.props.challenge.parent) &&
                       this.props.metaReviewEnabled &&
                        <li>
                          <div>
                            <ConfirmAction
                              action="onClick"
                              skipConfirmation={e => e.target.value === ""}>
                              <button
                                className="mr-text-current mr-pr-1 mr-text-green-lighter"
                                onClick={() => this.props.removeMetaReviewRequests(this.props.selectedTasks)}
                              >
                                <FormattedMessage {...messages.removeMetaReviewStatusLabel} />
                              </button>
                            </ConfirmAction>
                          </div>
                        </li>
                      }
                      <li>
                        <button
                          className="mr-text-green-lighter"
                          onClick={() => configureColumns()}>
                          <FormattedMessage {...messages.configureColumnsLabel} />
                        </button>
                      </li>
                    </ul>
                    <hr className="mr-rule-dropdown" />
                    <div className="mr-text-md mr-mb-2 mr-text-yellow">
                      <FormattedMessage {...messages.exportTitle} />
                    </div>
                    <div className="mr-mb-2">
                      <span className="mr-pr-2 mr-text-orange">
                        <FormattedMessage {...messages.timezoneLabel} />
                      </span>
                      <TimezonePicker
                        changeTimezone={this.props.changeTimezone}
                        currentTimezone={this.props.currentTimezone} />
                    </div>
                    <ul className="mr-list-dropdown">
                      <li>
                        <form method="post" action={buildLinkToExportCSV(_get(this.props, 'challenge.id'), this.props.criteria, this.props.currentTimezone)}>
                          <input type="hidden" name="taskPropertySearch"
                            value={JSON.stringify(_get(this.props,
                              'criteria.filters.taskPropertySearch', {}))}
                          />
                          <button type="submit" className="mr-flex mr-items-center mr-text-green-lighter mr-bg-transparent mr-align-top mr-pb-2">
                            <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                            <FormattedMessage {...messages.exportCSVLabel} />
                          </button>
                        </form>
                      </li>
                    </ul>
                    <ul className="mr-list-dropdown">
                      <li>
                        <form method="post" action={buildLinkToExportGeoJSON(_get(this.props, 'challenge.id'), this.props.criteria, this.props.currentTimezone, `challenge_${_get(this.props, 'challenge.id')}.geojson`)}>
                          <input type="hidden" name="taskPropertySearch"
                            value={JSON.stringify(_get(this.props,
                              'criteria.filters.taskPropertySearch', {}))}
                          />
                          <button type="submit" className="mr-flex mr-items-center mr-text-green-lighter mr-bg-transparent mr-align-top">
                            <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                            <FormattedMessage {...messages.exportGeoJSONLabel} />
                          </button>
                        </form>
                      </li>
                    </ul>
                    <ul className="mr-list-dropdown">
                      <li className="mr-mt-2">
                        <a target="_blank"
                           rel="noopener noreferrer"
                           href={`${buildLinkToMapperExportCSV(this.props.criteria)}&cid=${_get(this.props, 'challenge.id')}`}
                           className="mr-flex mr-items-center">
                          <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                          <FormattedMessage {...messages.exportMapperReviewCSVLabel} />
                        </a>
                      </li>
                    </ul>
                    {this.props.metaReviewEnabled &&
                      <ul className="mr-list-dropdown">
                        <li className="mr-mt-2">
                          <a target="_blank"
                             rel="noopener noreferrer"
                             href={`${buildLinkToReviewerMetaExportCSV(this.props.criteria)}&cid=${_get(this.props, 'challenge.id')}`}
                             className="mr-flex mr-items-center">
                            <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                            <FormattedMessage {...messages.exportReviewerMetaCSVLabel} />
                          </a>
                        </li>
                      </ul>
                    }
                  </React.Fragment>
                }
              />
            </div>
          </React.Fragment>
        }
      </div>
    )
  }
}

TaskAnalysisTableHeader.propTypes = {
    countShown: PropTypes.number.isRequired,
    configureColumns: PropTypes.func.isRequired,
}

export default injectIntl(
  WithSavedFilters(TaskAnalysisTableHeader, "adminSearchFilters")
)
