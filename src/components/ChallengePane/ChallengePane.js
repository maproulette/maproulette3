import React, { Component } from 'react'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import ChallengeFilterSubnav from './ChallengeFilterSubnav/ChallengeFilterSubnav'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import ChallengeSearchMap from '../ChallengeSearchMap/ChallengeSearchMap'
import ChallengeBrowseMap from '../ChallengeBrowseMap/ChallengeBrowseMap'
import CongratulateModal from '../CongratulateModal/CongratulateModal'
import ChallengeEndModal from '../ChallengeEndModal/ChallengeEndModal'
import ChallengeResultList from './ChallengeResultList/ChallengeResultList'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import WithFilteredChallenges
       from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithChallengeSearch from '../HOCs/WithSearch/WithChallengeSearch'
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults'
import WithBrowsedChallenge from '../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithClusteredTasks from '../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithTaskMarkers from '../HOCs/WithTaskMarkers/WithTaskMarkers'
import WithMapBoundedTasks from '../HOCs/WithMapBoundedTasks/WithMapBoundedTasks'
import WithStatus from '../HOCs/WithStatus/WithStatus'

// Setup child components with necessary HOCs
const ChallengeResults = WithStatus(ChallengeResultList)
const BrowseMap = WithTaskMarkers(ChallengeBrowseMap)
let SearchMap = null

// If the map-bounded task browsing feature is enabled, set up the ChallengeSearchMap
// to use it.
if (_get(process.env,
         'REACT_APP_FEATURE_BOUNDED_TASK_BROWSING') === 'enabled') {
  SearchMap = WithTaskMarkers(ChallengeSearchMap, 'mapBoundedTasks')
}
else {
  SearchMap = ChallengeSearchMap
}

/**
 * ChallengePane represents the top-level view when the user is browsing,
 * searching, and choosing a challenge to start working on. It includes
 * a ChallengeFilterSubnav that presents a subnav with filter and search
 * options, a ChallengeResultList (wrapped in a Sidebar) for presenting challenges
 * that match the current search and set of filters, and a ChallengeSearchMap for
 * finding challenges geographically.
 *
 * @see See [ChallengeFilterSubnav](#challengefiltersubnav)
 * @see See [ChallengeResultList](#challengeresultlist)
 * @see See [ChallengeSearchMap](#ChallengeSearchMap)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengePane extends Component {
  state = {
    sidebarMinimized: true,
  }

  toggleSidebarMinimized = () => {
    this.setState({sidebarMinimized: !this.state.sidebarMinimized})
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)
  }

  render() {
    const Map = this.props.browsedChallenge ? BrowseMap : SearchMap
    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-min-h-screen-50">
        {_get(this.props, 'history.location.state.congratulate', false) &&
         !_get(this.props, 'history.location.state.warn', false) &&
          <CongratulateModal />
        }
        {_get(this.props, 'history.location.state.warn', false) &&
         !_get(this.props, 'history.location.state.congratulate', false) &&
          <ChallengeEndModal />
        }
        <ChallengeFilterSubnav {...this.props} />

        <div className="mr-p-6 lg:mr-flex mr-cards-inverse">
          <ChallengeResults {...this.props} />
          <div className="mr-flex-1">
            <MapPane>
              <Map challenge={this.props.browsedChallenge}
                    onTaskClick={this.props.startChallengeWithTask}
                    {...this.props} />
            </MapPane>
          </div>
        </div>
      </div>
    )
  }
}

export default
  WithChallenges(
    WithChallengeSearch(
      WithFilteredChallenges(
        WithSearchResults(
          WithMapBoundedTasks(
            WithClusteredTasks(
              WithStartChallenge(
                WithBrowsedChallenge(ChallengePane)
              )
            )
          ),
          'challenges',
          'challenges'
        )
      )
    )
  )
