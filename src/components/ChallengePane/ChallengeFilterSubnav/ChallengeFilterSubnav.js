import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import MediaQuery from 'react-responsive'
import SearchBox from '../../SearchBox/SearchBox'
import MobileFilterMenu from '../../MobileFilterMenu/MobileFilterMenu'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengeSearch from '../../HOCs/WithSearch/WithChallengeSearch'
import FilterByDifficulty from './FilterByDifficulty'
import FilterByKeyword from './FilterByKeyword'
import FilterByLocation from './FilterByLocation'
import './ChallengeFilterSubnav.css'
import messages from './Messages'

// Setup child components with necessary HOCs
const LocationFilter = WithCurrentUser(FilterByLocation)

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
  render() {
    return (
      <nav className="challenge-filter-subnav navbar sub-nav"
           aria-label="challenge filters">
				<div className="navbar-menu">
          <div className="navbar-start">
            <MediaQuery query="(max-width: 1024px)">
              <MobileFilterMenu {...this.props} />
            </MediaQuery>

            <MediaQuery query="(min-width: 1024px)">
              <FilterByKeyword {...this.props} />
              <FilterByDifficulty {...this.props} />
              <LocationFilter {...this.props} />
            </MediaQuery>

            <SearchBox className='navbar-item'
                             placeholder={this.props.intl.formatMessage(messages.searchLabel)}
                             {...this.props} />
          </div>
				</div>
			</nav>
    )
  }
}

export default WithChallengeSearch(injectIntl(ChallengeFilterSubnav))
