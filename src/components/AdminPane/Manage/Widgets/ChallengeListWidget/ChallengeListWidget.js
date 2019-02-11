import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../../../services/Widget/Widget'
import { extendedFind } from '../../../../../services/Challenge/Challenge'
import WithSearchResults
       from '../../../../HOCs/WithSearchResults/WithSearchResults'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import SearchBox from '../../../../SearchBox/SearchBox'
import ChallengeList from '../../ChallengeList/ChallengeList'
import QuickWidget from '../../../../QuickWidget/QuickWidget'
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
const ChallengeSearch = WithSearch(
  SearchBox,
  'challengeListWidget',
  searchCriteria =>
    extendedFind({searchQuery: searchCriteria.query, onlyEnabled: false}, 1000),
)

export default class ChallengeListWidget extends Component {
  render() {
    const searchControl = this.props.projects.length === 0 ? null : (
      <ChallengeSearch className="challenge-list-widget__searchbox" 
                       inputClassName="mr-text-blue mr-border-b mr-border-blue"
                       placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)} />
    )

    return (
      <QuickWidget {...this.props}
                  className="challenge-list-widget"
                  widgetTitle={<FormattedMessage {...messages.title} />}
                  headerControls={searchControl}>
        <ChallengeList {...this.props}
                       challenges={this.props.challenges}
                       suppressControls />
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
