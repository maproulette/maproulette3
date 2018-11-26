import React, { Component } from 'react'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import SimpleDropdown from '../Bulma/SimpleDropdown'
import Menu from '../Bulma/Menu'
import FilterByDifficulty
       from '../ChallengePane/ChallengeFilterSubnav/FilterByDifficulty'
import FilterByLocation
       from '../ChallengePane/ChallengeFilterSubnav/FilterByLocation'
import FilterByKeyword
       from '../ChallengePane/ChallengeFilterSubnav/FilterByKeyword'
import WithDeactivateOnOutsideClick from
       '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import './MobileFilterMenu.scss'

// Setup child components with necessary HOCs
const LocationFilter = WithCurrentUser(FilterByLocation)

export class MobileFilterMenu extends Component {
  render() {
    const filterLabel =
      <span className="mobile-filter-menu__label">Filter</span>

    return (
      <SimpleDropdown className="mobile-filter-menu" label={filterLabel}
                      isActive={this.props.isActive}
                      toggleActive={this.props.toggleActive}>
        <Menu {...this.props}>
          <FilterByDifficulty asMenuList {...this.props} />
          <LocationFilter asMenuList {...this.props} />
          <FilterByKeyword asMenuList {...this.props} />
        </Menu>
      </SimpleDropdown>
    )
  }
}

export default WithDeactivateOnOutsideClick(MobileFilterMenu)
