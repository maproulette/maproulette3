import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _difference from 'lodash/difference'
import _join from 'lodash/join'
import _isEmpty from 'lodash/isEmpty'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import { extendedFind } from '../../../../../services/Challenge/Challenge'
import { buildLinkToMapperExportCSV } from '../../../../../services/Task/TaskReview/TaskReview'
import WithSearchResults
       from '../../../../HOCs/WithSearchResults/WithSearchResults'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import SearchBox from '../../../../SearchBox/SearchBox'
import ChallengeList from '../../ChallengeList/ChallengeList'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import Dropdown from '../../../../Dropdown/Dropdown'
import TimezonePicker from '../../../../TimezonePicker/TimezonePicker'
import {DEFAULT_TIMEZONE_OFFSET} from '../../../../TimezonePicker/TimezonePicker'
import messages from './Messages'

const descriptor = {
  widgetKey: 'ChallengeListWidget',
  label: messages.label,
  targets: [WidgetDataTarget.challenges],
  minWidth: 3,
  defaultWidth: 12,
  defaultHeight: 15,
  defaultConfiguration: {
    view: 'list',
    sortBy: ['name'],
    timezoneOffset: DEFAULT_TIMEZONE_OFFSET,
  },
}

// Setup child components with needed HOCs.
class ChallengeSearchBox extends Component {
  componentDidUpdate(prevProps) {
    if (_get(this.props, 'searchQuery.query') !==
        _get(prevProps, 'searchQuery.query')) {
      if (!_get(this.props, 'searchQuery.query')) {
        this.props.toggleSearchTallies(this.props.projectId)
      }
      else if (!_get(prevProps, 'searchQuery.query')) {
        this.props.toggleSearchTallies(this.props.projectId, _map(this.props.challenges, (c) => c.id))
      }
    }
  }

  render() {
    return <SearchBox {...this.props} />
  }
}

const ChallengeSearch = WithSearch(
  ChallengeSearchBox,
  'challengeListWidget',
  searchCriteria =>
    extendedFind({searchQuery: searchCriteria.query, onlyEnabled: false}, 1000),
)

export default class ChallengeListWidget extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.challenges && !this.props.talliedChallenges(this.props.project.id)) {
      this.props.updateTallyMarks(this.props.project.id, _map(this.props.challenges, (c) => c.id))
    }
  }

  setTimezone = timezoneOffset => {
    if (this.props.widgetConfiguration.timezoneOffset !== timezoneOffset) {
      this.props.updateWidgetConfiguration({timezoneOffset})
    }
  }

  toggleAllTallies = () => {
    if ((this.props.talliedChallenges(this.props.project.id) || []).length ===
        (this.props.challenges || []).length) {
      this.props.updateTallyMarks(this.props.project.id, [])
    }
    else {
      this.props.updateTallyMarks(this.props.project.id, _map(this.props.challenges, (c) => c.id))
    }
  }

  render() {
    const tallied = this.props.talliedChallenges(this.props.project.id) || []
    const allEnabled = _difference(_map(this.props.challenges, c => c.id), tallied).length === 0
    const someEnabled = tallied.length !== 0

    const selectedChallengeIds = _join(this.props.talliedChallenges(this.props.project.id), ',')

    // project export CSV needs 'cId' (with capital I)
    const cId = _isEmpty(selectedChallengeIds) ? "" : `cId=${selectedChallengeIds}`

    // export mapper review CSV needs 'cid'
    const cIdReview = _isEmpty(selectedChallengeIds) ? "" : `cid=${selectedChallengeIds}`
    const pIdReview = _isEmpty(selectedChallengeIds) ? `pid=${this.props.project.id}` : ""

    const archivedOn = this.props.dashboardChallengeFilters.archived;

    const bulkArchive = () => {
      this.props.bulkArchive(tallied, !archivedOn, this.props.clearTallies)
    }

    const rightHeaderControls = this.props.projects.length === 0 ? null : (
      <div className="mr-flex mr-justify-end mr-items-center">
        <button className="mr-ml-4" onClick={this.toggleAllTallies}>
          <SvgSymbol
            className={classNames(
              "mr-w-4 mr-h-4",
              {
                "mr-fill-mango": allEnabled,
                "mr-fill-mango-60": someEnabled && !allEnabled,
                "mr-fill-mango-30": !someEnabled && !allEnabled
              }
            )}
            viewBox='0 0 20 20'
            sym='chart-icon'
          />
        </button>
        <div className="mr-pt-2 mr-pl-4">
          <Dropdown
            className="mr-dropdown--right"
            dropdownButton={dropdown => (
              <button
                onClick={dropdown.toggleDropdownVisible}
                className="mr-flex mr-items-center mr-text-green-lighter"
              >
                <SvgSymbol
                  sym="cog-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-5 mr-h-5"
                />
              </button>
            )}
            dropdownContent={() =>
              <ul className="mr-list-dropdown">
                {someEnabled && 
                  <li>
                    <div
                      className={classNames(
                        this.props.controlClassName,
                        "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer"
                      )}
                      onClick={bulkArchive}
                    >
                      {archivedOn ? "Unarchive Selected" : "Archive Selected"}
                    </div>
                  </li>
                }
                <li className="mr-text-md mr-mb-2 mr-text-yellow">
                  <FormattedMessage {...messages.exportTitle} />
                </li>
                <li className="mr-mb-2">
                  <span className="mr-pr-1 mr-pb-2 mr-text-orange mr-text-sm">
                    <FormattedMessage {...messages.timezoneLabel} />
                  </span>
                  <TimezonePicker
                    changeTimezone={this.setTimezone}
                    currentTimezone={this.props.widgetConfiguration.timezoneOffset}
                  />
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}` +
                          `/api/v2/project/${_get(this.props, 'project.id')}` +
                          `/tasks/extract?${cId}&timezone=` +
                          `${encodeURIComponent(
                              _get(this.props.widgetConfiguration, 'timezoneOffset', '')
                             )}`}
                    className="mr-flex mr-items-center"
                  >
                    <SvgSymbol
                      className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                      viewBox='0 0 20 20'
                      sym='download-icon'
                    />
                    <FormattedMessage {...messages.exportCSVLabel} />
                  </a>
                </li>
                <li className="mr-mt-2">
                  <a target="_blank"
                      rel="noopener noreferrer"
                      href={`${buildLinkToMapperExportCSV(this.props.criteria)}&${cIdReview}${pIdReview}`}
                      className="mr-flex mr-items-center"
                  >
                      <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                      <FormattedMessage {...messages.exportMapperReviewCSVLabel} />
                  </a>
                </li>
              </ul>
            }
          />
        </div>
      </div>
    )

    const searchControl = (
      <ChallengeSearch
        toggleSearchTallies={this.props.toggleSearchTallies}
        challenges={this.props.challenges}
        projectId={this.props.project.id}
        placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)}
      />
    )

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        headerControls={<div className="mr-my-2">{searchControl}</div>}
        rightHeaderControls={<div className="mr-my-2">{rightHeaderControls}</div>}
      >
        <div className="mr-pb-32">
          <ChallengeList
            {...this.props}
            challenges={this.props.challenges}
            suppressControls
          />
        </div>
      </QuickWidget>
    )
  }
}

ChallengeListWidget.propTypes = {
  widgetConfiguration: PropTypes.object,
  updateWidgetConfiguration: PropTypes.func.isRequired,
}

const Widget = WithSearchResults(
  injectIntl(ChallengeListWidget),
  'challengeListWidget',
  'challenges',
  'challenges'
)

registerWidgetType(Widget, descriptor)
