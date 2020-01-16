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
import WithSearchResults
       from '../../../../HOCs/WithSearchResults/WithSearchResults'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import SearchBox from '../../../../SearchBox/SearchBox'
import ChallengeList from '../../ChallengeList/ChallengeList'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import Dropdown from '../../../../Dropdown/Dropdown'
import messages from './Messages'
import './ChallengeListWidget.scss'

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
    const cId = _isEmpty(selectedChallengeIds) ? "" : `cId=${selectedChallengeIds}`

    const rightHeaderControls = this.props.projects.length === 0 ? null : (
      <div className=''>
        <div className='item-tally-toggle'>
          <div className="clickable" onClick={this.toggleAllTallies}>
            <SvgSymbol className={classNames('icon', {turnOff: allEnabled, partialOn: someEnabled && !allEnabled})}
                        viewBox='0 0 20 20'
                        sym='chart-icon' />
          </div>
        </div>
        <div className="mr-float-right mr-pt-3 mr-pl-4">
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
                        <li>
                          <a target="_blank"
                              rel="noopener noreferrer"
                              href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/project/${_get(this.props, 'project.id')}/tasks/extract?${cId}`}
                              className="mr-flex mr-items-center"
                          >
                              <SvgSymbol sym='download-icon' viewBox='0 0 20 20' className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2" />
                              <FormattedMessage {...messages.exportCSVLabel} />
                          </a>
                        </li>
                      </ul>
                  </React.Fragment>
              }
          />
        </div>
        <ChallengeSearch className="mr-p-2 mr-text-grey-light mr-border mr-border-grey-light mr-rounded-sm"
                         inputClassName="mr-text-grey mr-leading-normal"
                         toggleSearchTallies={this.props.toggleSearchTallies}
                         challenges={this.props.challenges}
                         projectId={this.props.project.id}
                         placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)} />

      </div>
    )

    return (
      <QuickWidget {...this.props}
                  className="challenge-list-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}
                  rightHeaderControls={rightHeaderControls}>
        <ChallengeList {...this.props}
                       challenges={this.props.challenges} />
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
