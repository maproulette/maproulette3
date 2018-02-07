import React, { Component } from 'react'
import { searchChallenges } from '../../../services/Challenge/Challenge'
import WithSearchExecution from '../../HOCs/WithSearchExecution/WithSearchExecution'
import SearchBox from '../../SearchBox/SearchBox'
import WithCurrentUser from '../../HOCs/WithCurrentUser/WithCurrentUser'
import WithChallengeFilters from '../../HOCs/WithChallengeFilters/WithChallengeFilters'
import WithMapBounds from '../../HOCs/WithMapBounds/WithMapBounds'
import FilterByDifficulty from './FilterByDifficulty'
import FilterByKeyword from './FilterByKeyword'
import FilterByLocation from './FilterByLocation'
import './ChallengeFilterSubnav.css'

// Setup child components with necessary HOCs
const LocationFilter = WithCurrentUser(FilterByLocation)
const ChallengeSearch =
  WithSearchExecution(SearchBox, 'challenges', searchChallenges)

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
            <FilterByKeyword {...this.props} />
            <FilterByDifficulty {...this.props} />
            <LocationFilter {...this.props} />
            <ChallengeSearch className='navbar-item'
                             placeholder='Search for a challenge...'
                             {...this.props} />
          </div>
				</div>
			</nav>
    )
  }
}

export default WithChallengeFilters(WithMapBounds(ChallengeFilterSubnav))
