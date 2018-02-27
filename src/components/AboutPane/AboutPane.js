import React, { Component } from 'react'
import { MAPBOX_STREETS } from '../../services/VisibleLayer/LayerSources'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import LocatorMap from '../LocatorMap/LocatorMap'
import AboutModal from './AboutModal/AboutModal'

/**
 * AboutPane displays the AboutModal on top of the locator map in the background
 * (for visual appeal).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AboutPane extends Component {
  render() {
    return (
      <div className="about-pane">
        <MapPane>
          <LocatorMap layerSourceId={MAPBOX_STREETS} className="about" {...this.props} />
        </MapPane>

        <AboutModal {...this.props} />
      </div>
    )
  }
}
