import React, { Component } from 'react'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import ChallengeSearchMap from '../ChallengeSearchMap/ChallengeSearchMap'
import AboutModal from './AboutModal/AboutModal'

/**
 * AboutPane displays the AboutModal on top of the challenge search map in the
 * background (for visual appeal).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AboutPane extends Component {
  render() {
    return (
      <div className="about-pane">
        <MapPane>
          <ChallengeSearchMap className="about" {...this.props} />
        </MapPane>

        <AboutModal {...this.props} />
      </div>
    )
  }
}
