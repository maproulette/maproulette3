import React, { Component } from 'react'
import _isEqual from 'lodash/isEqual'
import { MAPBOX_STREETS } from '../../services/VisibleLayer/LayerSources'
import ChallengeFilterSubnav from './ChallengeFilterSubnav/ChallengeFilterSubnav'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import Sidebar from '../Sidebar/Sidebar'
import LocatorMap from '../LocatorMap/LocatorMap'
import ChallengeResultList from './ChallengeResultList/ChallengeResultList'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import WithTaskClusters from '../HOCs/WithTaskClusters/WithTaskClusters'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import './ChallengePane.css'

// Setup child components with necessary HOCs
const ChallengeResults =
  WithStatus(WithChallenges(ChallengeResultList('challenges')))

const ChallengeLocatorMap = WithTaskClusters(LocatorMap)

/**
 * ChallengePane represents the top-level view when the user is browsing,
 * searching, and choosing a challenge to start working on. It includes
 * a ChallengeFilterSubnav that presents a subnav with filter and search
 * options, a ChallengeResultList (wrapped in a Sidebar) for presenting challenges
 * that match the current search and set of filters, and a LocatorMap for
 * finding challenges geographically.
 *
 * @see See [ChallengeFilterSubnav](#challengefiltersubnav)
 * @see See [ChallengeResultList](#challengeresultlist)
 * @see See [LocatorMap](#locatormap)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengePane extends Component {
  state = {
    /**
     * The actively expanded challenge being browsed during challenge discovery.
     * The ChallengeResultItem will expand to show more information about the
     * challenge, and the LocatorMap will pan/zoom to the bounding box of the
     * challenge and display its clustered tasks.
     */
    browsingChallenge: null
  }

  /**
   * Invoked to indicate that the user has begun browsing (expanded) the given
   * challenge during challenge discovery.
   */
  startBrowsingChallenge = challenge =>
    this.setState({browsingChallenge: challenge})

  /**
   * Invoked to indicate that the user has stopped browsing (minimized) the given
   * challenge during challenge discovery.
   */
  stopBrowsingChallenge = () =>
    this.setState({browsingChallenge: null})


  shouldComponentUpdate(nextProps, nextState) {
    return !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)
  }

  render() {
    return (
      <span>
        <ChallengeFilterSubnav {...this.props} />

        <div className="challenge-pane">
          <Sidebar className='inline full-screen-height with-shadow challenge-pane__results'
                   isActive={true}>
            <ChallengeResults browsingChallenge={this.state.browsingChallenge}
                              startBrowsingChallenge={this.startBrowsingChallenge}
                              stopBrowsingChallenge={this.stopBrowsingChallenge}
                              {...this.props} />
          </Sidebar>

          <MapPane>
            <ChallengeLocatorMap layerSourceName={MAPBOX_STREETS}
                                 browsingChallenge={this.state.browsingChallenge}
                                 mappedChallenge={this.state.browsingChallenge}
                                 {...this.props} />
          </MapPane>
        </div>
      </span>
    )
  }
}
