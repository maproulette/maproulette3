import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import _reject from 'lodash/reject'
import _get from 'lodash/get'
import { injectIntl } from 'react-intl'
import NavDropdown from '../../Bulma/NavDropdown'
import { ChallengeLocation,
         locationLabels }
       from '../../../services/Challenge/ChallengeLocation/ChallengeLocation'
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
  updateFilter = ({ value }) => {
    if (value === null) {
      this.props.removeChallengeFilters(['location'])
    }
    else {
      // For both nearMe and withinMapBounds options, we actually use the
      // withinMapBounds filter -- we just also set the map bounds to be near
      // the user in the nearMe case.
      this.props.setChallengeFilters({location: ChallengeLocation.withinMapBounds})

      if (value === ChallengeLocation.nearMe) {
        this.props.locateMapToUser(this.props.user)
      }
      else if (value === ChallengeLocation.withinMapBounds) {
        this.props.updateBoundedChallenges(
          _get(this.props, 'mapBounds.locator.bounds'))
      }
    }
  }

  render() {
    const localizedLocationLabels = locationLabels(this.props.intl)

    let selectOptions = _map(ChallengeLocation, (location, name) => ({
      key: location,
      text: localizedLocationLabels[name],
      value: location,
    }))

    // Add 'Any' option to start of dropdown
    const anyOption = {
      key: 'any',
      text: localizedLocationLabels.any,
      value: null,
    }
    selectOptions.unshift(anyOption)

    // If there is no user, remove the nearMe option.
    if (!this.props.user) {
      selectOptions = _reject(selectOptions, {value: ChallengeLocation.nearMe})
    }

    return (
      <NavDropdown placeholder={anyOption.text}
                   label={this.props.intl.formatMessage(messages.locationLabel)}
                   options={selectOptions}
                   value={this.props.challengeFilter.location}
                   onChange={this.updateFilter}
      />
    )
  }
}

FilterByLocation.propTypes = {
  /** The current map bounds */
  mapBounds: PropTypes.object,
  /** Invoked to update the challenge location filter */
  setChallengeFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge location filter */
  removeChallengeFilters: PropTypes.func.isRequired,
  /** Invoked when the user chooses the 'near me' option */
  locateMapToUser: PropTypes.func.isRequired,
  /** Invoked when the user chooses 'within map bounds' option */
  updateBoundedChallenges: PropTypes.func.isRequired,
  /** The current value of the challenge filter */
  challengeFilter: PropTypes.object,
  /** The current logged-in user, if any */
  user: PropTypes.object,
}

FilterByLocation.defaultProps = {
  challengeFilter: {},
}

export default injectIntl(FilterByLocation)
