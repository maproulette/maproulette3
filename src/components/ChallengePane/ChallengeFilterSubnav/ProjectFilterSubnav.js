import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import WithChallengeSearch from '../../HOCs/WithSearch/WithChallengeSearch'
import FilterByDifficulty from './FilterByDifficulty'
import FilterByKeyword from './FilterByKeyword'
import FilterByCategorizationKeywords from './FilterByCategorizationKeywords'
import ClearFiltersControl from './ClearFiltersControl'
import SortChallengesSelector from './SortChallengesSelector'
import './ChallengeFilterSubnav.scss'
import messages from './Messages'

/**
 * ProjectilterSubnav presents a navigation bar that contains options
 * for filtering MapRoulette challenges within the project browse view.
 *
 * @see See FilterByDifficulty
 * @see See FilterByKeyword
 * @see See FilterByCategorizationKeywords
 *
 */
export class ProjectilterSubnav extends Component {
  clearFilters = () => {
    this.props.clearSearchFilters()
    this.props.clearSearch()
  }

  render() {
    const filtersActive =
      this.props.unfilteredChallenges?.length > this.props.challenges?.length

    return (
      <header className="mr-bg-black-10 mr-shadow mr-py-4 lg:mr-py-0 mr-px-6 mr-hidden lg:mr-flex mr-items-center mr-justify-between">
        <div className="mr-flex-grow mr-flex mr-items-center mr-justify-between lg:mr-justify-start">
          <h1 className="mr-hidden xl:mr-flex mr-text-3xl mr-leading-tight mr-font-normal mr-mr-6">
            <FormattedMessage {...messages.header} />
          </h1>

          <div className="mr-flex mr-items-center">
            <SortChallengesSelector {...this.props} />
            <FilterByKeyword {...this.props} />
            <FilterByDifficulty {...this.props} />
            <FilterByCategorizationKeywords {...this.props} />
          </div>

          {filtersActive && (
            <ClearFiltersControl clearFilters={this.clearFilters} />
          )}
        </div>
      </header>
    )
  }
}

export default WithChallengeSearch(injectIntl(ProjectilterSubnav))
