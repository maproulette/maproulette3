import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { DashboardDataTarget } from '../../../../../services/Dashboard/Dashboard'
import { extendedFind } from '../../../../../services/Challenge/Challenge'
import WithSearchResults
       from '../../../../HOCs/WithSearchResults/WithSearchResults'
import WithSearch from '../../../../HOCs/WithSearch/WithSearch'
import SearchBox from '../../../../SearchBox/SearchBox'
import { registerBlockType } from '../BlockTypes'
import ChallengeList from '../../ChallengeList/ChallengeList'
import QuickBlock from '../QuickBlock'
import messages from './Messages'
import './ChallengeListBlock.scss'

const descriptor = {
  blockKey: 'ChallengeListBlock',
  label: messages.label,
  targets: [DashboardDataTarget.challenges],
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
  'challengeListBlock',
  searchCriteria =>
    extendedFind({searchQuery: searchCriteria.query, onlyEnabled: false}, 1000),
)

export default class ChallengeListBlock extends Component {
  render() {
    const searchControl = this.props.projects.length === 0 ? null : (
      <ChallengeSearch className="challenge-list-block__searchbox"
                       placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)} />
    )

    return (
      <QuickBlock {...this.props}
                  className="challenge-list-block"
                  blockTitle={<FormattedMessage {...messages.title} />}
                  headerControls={searchControl}>
        <ChallengeList {...this.props}
                       challenges={this.props.challenges}
                       suppressControls />
      </QuickBlock>
    )
  }
}

ChallengeListBlock.propTypes = {
  blockConfiguration: PropTypes.object,
  updateBlockConfiguration: PropTypes.func.isRequired,
}

const Block = WithSearchResults(
  injectIntl(ChallengeListBlock),
  'challengeListBlock',
  'challenges',
  'challenges'
)

registerBlockType(Block, descriptor)
