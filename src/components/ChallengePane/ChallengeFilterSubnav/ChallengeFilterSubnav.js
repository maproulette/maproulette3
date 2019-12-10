import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import SearchBox from '../../SearchBox/SearchBox'
import WithChallengeSearch from '../../HOCs/WithSearch/WithChallengeSearch'
import WithCommandInterpreter from '../../HOCs/WithCommandInterpreter/WithCommandInterpreter'
import FilterByDifficulty from './FilterByDifficulty'
import FilterByKeyword from './FilterByKeyword'
import ClearFiltersControl from './ClearFiltersControl'
import SortChallengesSelector from './SortChallengesSelector'
import './ChallengeFilterSubnav.scss'
import messages from './Messages'

// Setup child components with necessary HOCs
const CommandSearchBox = WithCommandInterpreter(SearchBox)

/**
 * ChallengeFilterSubnav presents a navigation bar that contains options
 * for filtering MapRoulette challenges, as well as a search box for
 * further narrowing down challenges.
 *
 * @see See FilterByDifficulty
 * @see See FilterByKeyword
 * @see See FilterByLocation
 * @see See SearchBox
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeFilterSubnav extends Component {
  clearFilters = () => {
    this.props.clearSearchFilters()
    this.props.clearSearch()
  }

  render() {
    const filtersActive =
      this.props.unfilteredChallenges.length > this.props.challenges.length

    return (
      <header className="mr-bg-white-10 mr-shadow mr-py-4 lg:mr-py-0 mr-px-6 mr-hidden lg:mr-flex mr-items-center mr-justify-between">
        <div className="mr-flex-grow mr-flex mr-items-center mr-justify-between lg:mr-justify-start">
          <h1 className="mr-hidden xl:mr-flex mr-text-3xl mr-leading-tight mr-font-normal mr-mr-6">
            <FormattedMessage {...messages.header} />
          </h1>

          <div className="mr-flex">
            <SortChallengesSelector {...this.props} />
            <FilterByKeyword {...this.props} />
            <FilterByDifficulty {...this.props} />
            <CommandSearchBox
              {...this.props}
              placeholder={this.props.intl.formatMessage(messages.searchLabel)}
              showSearchTypeFilter
              setSearch={this.props.setSearch}
            />
          </div>

          {filtersActive && (
            <ClearFiltersControl clearFilters={this.clearFilters} />
          )}
        </div>
      </header>
    )
  }
}

export default WithChallengeSearch(injectIntl(ChallengeFilterSubnav))
