import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
import _noop from 'lodash/noop'
import { injectIntl, FormattedMessage } from 'react-intl'
import { ChallengeLocation,
         locationLabels }
       from '../../../services/Challenge/ChallengeLocation/ChallengeLocation'
import messages from './Messages'

/**
 * FilterByLocation displays radio buttons for filtering challenges by
 * geographic location -- Intersects Map or Anywhere.
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
  updateFilter = (value, closeDropdownMenu) => {
    if (_isEmpty(value)) {
      this.props.removeSearchFilters(['location'])
    }
    else {
      // For nearMe, we actually use the withinMapBounds setting -- we just
      // also set the map bounds to be near the user.
      if (value === ChallengeLocation.nearMe) {
        // Note: repositioning the map will automatically trigger an update of the
        // bounded challenges, so we don't need to request an update here.
        this.props.setSearchFilters({location: ChallengeLocation.intersectingMapBounds})
        this.props.locateMapToUser(this.props.user)
      }
      else {
        this.props.setSearchFilters({location: value})
      }
    }
  }

  componentDidMount(){
    // Default to 'intersectingMapBounds'
    this.props.setSearchFilters({location: ChallengeLocation.intersectingMapBounds})
  }

  render() {
    const localizedLocationLabels = locationLabels(this.props.intl)

    return (
      <div className="form mr-flex mr-items-center mr-mb-6">
        <span className="mr-mr-4 mr-text-xs mr-uppercase mr-text-white">
          <FormattedMessage {...messages.locationLabel} />:
        </span>
        <span className="mr-flex mr-items-baseline">
          <input
            type="radio"
            name="intersectsMap"
            className="mr-mr-1"
            checked={this.props.searchFilters.location === ChallengeLocation.intersectingMapBounds}
            onClick={() => this.updateFilter(ChallengeLocation.intersectingMapBounds)}
            onChange={_noop}
          />
          <label className="mr-ml-1 mr-mr-4">
            {localizedLocationLabels[ChallengeLocation.intersectingMapBounds]}
          </label>
        </span>
        <span className="mr-flex mr-items-baseline">
          <input
            type="radio"
            name="intersectsMap"
            className="mr-mr-1"
            checked={this.props.searchFilters.location !== ChallengeLocation.intersectingMapBounds}
            onClick={() => this.updateFilter(null)}
            onChange={_noop}
          />
          <label className="mr-ml-1 mr-mr-4">
            {localizedLocationLabels.any}
          </label>
        </span>
      </div>
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
