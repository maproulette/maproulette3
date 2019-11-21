import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import _isUndefined from 'lodash/isUndefined'
import LocationSearchBox from '../EnhancedMap/SearchControl/LocationSearchBox'
import { ChallengeLocation}
       from '../../services/Challenge/ChallengeLocation/ChallengeLocation'
import { toLatLngBounds } from '../../services/MapBounds/MapBounds'
import { MIN_ZOOM } from './TaskClusterMap'
import messages from './Messages'

/**
 * ZoomInMessage presents a message to the user saying they need to zoom in
 * to see tasks. It also presents them with a 'near me' button and a box
 * to perform a nominatum query.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ZoomInMessage extends Component {
  state = {
  }

  componentDidUpdate(prevProps) {
    // If user has zoomed in then we want to minimized
    if (prevProps.zoom < this.props.zoom &&
        prevProps.zoom <= MIN_ZOOM && !this.state.minimized) {
      this.setState({minimized: true})
    }
    // If user has zoomed out then we want to un-minimize
    else if (prevProps.zoom > this.props.zoom &&
             this.props.zoom <= MIN_ZOOM && this.state.minimized) {
      this.setState({minimized: false})
    }
    // If minimized is undefined this is the first time this is loading
    else if (_isUndefined(this.state.minimized)) {
      this.setState({minimized: (this.props.zoom > MIN_ZOOM)})
    }
  }

  render() {
    return (
      <div className="mr-absolute mr-pin-t mr-mt-3 mr-w-full mr-flex mr-justify-center">
        <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-black-40 mr-text-white mr-rounded">
          <div className="mr-py-2 mr-px-3 mr-text-center">
            <FormattedMessage {...messages.zoomInForTasksLabel} />
            <div className="mr-pl-8 mr-inline-block"
                 onClick={() => this.setState({minimized: !this.state.minimized})}>
              <SvgSymbol
                sym="icon-cheveron-down"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-5 mr-h-5 mr-text-white"
              />
            </div>
          </div>
          {!this.state.minimized &&
            <div className="mr-flex mr-items-center mr-pb-3 mr-px-3">
              <button
                className="mr-button mr-button--small mr-button--blue-fill"
                onClick={() => {
                  this.props.setSearchFilters({location: ChallengeLocation.intersectingMapBounds})
                  this.setState({locatingToUser: true})
                  this.props.locateMapToUser(this.props.user).then(() => {
                    this.setState({locatingToUser: false})
                  })
                }}
              >
                <FormattedMessage {...messages.nearMeLabel } />
              </button>
              <span className="mr-mx-4 mr-pt-1"><FormattedMessage {...messages.orLabel } /></span>
              <LocationSearchBox
                {...this.props}
                onResultSelected={(bounds, zoom) => {
                  this.currentBounds = toLatLngBounds(bounds)
                  this.props.updateBounds(bounds, zoom, true)
                }}
              />
            </div>
          }
        </div>
      </div>
    )
  }
}

export default ZoomInMessage
