import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import { injectIntl, FormattedMessage } from 'react-intl'
import { ChallengeLocation,
         locationLabels }
       from '../../../services/Challenge/ChallengeLocation/ChallengeLocation'
import Dropdown from '../../Dropdown/Dropdown'
import ButtonFilter from './ButtonFilter'
import messages from './Messages'

/**
 * FilterByLocation displays a nav dropdown containing options for filtering
 * challenges by geographic location, such as Within Map Bounds and Near Me.
 * The redux store is updated to reflect the selected option.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class FilterByLocation extends Component {
  /**
   * Update the challenge filter with the selected value
   *
   * @private
   */
  updateFilter = value => {
    if (_isEmpty(value)) {
      this.props.removeSearchFilters(['location'])
    }
    else {
      // For nearMe, we actually use the withinMapBounds setting -- we just
      // also set the map bounds to be near the user.
      if (value === ChallengeLocation.nearMe) {
        // Note: repositioning the map will automatically trigger an update of the
        // bounded challenges, so we don't need to request an update here.
        this.props.setSearchFilters({location: ChallengeLocation.withinMapBounds})
        this.props.locateMapToUser(this.props.user)
      }
      else {
        this.props.setSearchFilters({location: value})
      }
    }
  }

  render() {
    const localizedLocationLabels = locationLabels(this.props.intl)

    const menuItems = _map(ChallengeLocation, (location, name) => (
      <li key={location}>
        <Link to={{}} onClick={() => this.updateFilter(location)}>
          {localizedLocationLabels[name]}
        </Link>
      </li>
    ))

    // Add 'Any' option to start of dropdown
    menuItems.unshift(
      <li key='any'>
        <Link to={{}} onClick={() => this.updateFilter(null)}>
          {localizedLocationLabels.any}
        </Link>
      </li>
    )

    return (
      <Dropdown
        className="mr-dropdown--flush xl:mr-border-l xl:mr-border-white-10 mr-p-6 mr-pl-0 xl:mr-pl-6"
        button={
          <ButtonFilter
            type={<FormattedMessage {...messages.locationLabel} />}
            selection={
              _isEmpty(this.props.searchFilters.location) ?
              localizedLocationLabels.any :
              localizedLocationLabels[this.props.searchFilters.location]
            }
          />
        }
      >
        <ol className="mr-list-dropdown mr-list-dropdown--ruled">
          {menuItems}
        </ol>
      </Dropdown>
    )
  }
}

FilterByLocation.propTypes = {
  /** The current map bounds */
  mapBounds: PropTypes.object,
  /** Invoked to update the challenge location filter */
  setSearchFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge location filter */
  removeSearchFilters: PropTypes.func.isRequired,
  /** Invoked when the user chooses the 'near me' option */
  locateMapToUser: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  searchFilters: PropTypes.object,
  /** The current logged-in user, if any */
  user: PropTypes.object,
}

FilterByLocation.defaultProps = {
  searchFilters: {},
}

export default injectIntl(FilterByLocation)
