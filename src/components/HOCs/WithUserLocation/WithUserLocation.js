import React, { Component } from 'react'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithUserLocation provides the wrapped component with functions that can be
 * used to geolocate the current user. It will attempt to use the browser's
 * geolocation facilities, falling back to the home location in the user's OSM
 * profile.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithUserLocation = function(WrappedComponent) {
  return class extends Component {
    /**
     * Retrieve user's home location as setup in their OSM profile
     *
     * @private
     */
    getOSMHomeLocation = user => _get(user, 'osmProfile.homeLocation')

    /**
     * Retrieve user's location as returned by their browser, if supported and
     * allowed, or else their OSM profile home location. Returned object will
     * have latitude and longitude fields if a location is available, or will
     * be undefined or empty if not.
     */
    getUserCenterpoint = user => new Promise((resolve, reject) => {
      if (!navigator || !navigator.geolocation) {
        // No browser geolocation service available
        resolve(this.getOSMHomeLocation(user))
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position.coords),        // success
        () => resolve(this.getOSMHomeLocation(user)) // failure
      )
    })

    /**
     * Retrieves a bounding box around the user's location based on the user's
     * centerpoint and the `REACT_APP_NEARBY_LONGITUDE_LENGTH` and
     * `REACT_APP_NEARBY_LATITIDE_LENGTH` .env configuration variables. Returns
     * a promise that resolves to an WSEN array if a user centerpoint is
     * available, or rejects with an error if not.
     */
    getUserBounds = user => new Promise((resolve, reject) => {
      this.getUserCenterpoint(user).then(centerpoint => {
        if (!centerpoint ||
            !_isFinite(centerpoint.latitude) || !_isFinite(centerpoint.longitude)) {
          reject(AppErrors.user.missingHomeLocation)
          return
        }

        const bboxWidth = parseFloat(process.env.REACT_APP_NEARBY_LONGITUDE_LENGTH)
        const bboxHeight = parseFloat(process.env.REACT_APP_NEARBY_LATITUDE_LENGTH)

        // Build WSEN bounds array
        resolve([
          centerpoint.longitude - (bboxWidth / 2.0),
          centerpoint.latitude - (bboxHeight / 2.0),
          centerpoint.longitude + (bboxWidth / 2.0),
          centerpoint.latitude + (bboxHeight / 2.0)
        ])
      })
    })

    render() {
      return <WrappedComponent getUserCenterpoint={this.getUserCenterpoint}
                               getUserBounds={this.getUserBounds}
                               {...this.props} />
    }
  }
}

export default WithUserLocation
