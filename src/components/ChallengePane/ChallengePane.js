import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import { Popup } from 'react-leaflet'
import ChallengeFilterSubnav from './ChallengeFilterSubnav/ChallengeFilterSubnav'
import FilterByLocation from './ChallengeFilterSubnav/FilterByLocation'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import TaskClusterMap from '../TaskClusterMap/TaskClusterMap'
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
import WithMapBoundedTasks from '../HOCs/WithMapBoundedTasks/WithMapBoundedTasks'
import WithStatus from '../HOCs/WithStatus/WithStatus'
import WithChallengeTaskClusters from '../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters'
import WithTaskClusterMarkers from '../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import { fromLatLngBounds } from '../../services/MapBounds/MapBounds'
import { ChallengeStatus } from '../../services/Challenge/ChallengeStatus/ChallengeStatus'
import TaskChallengeMarkerContent from './TaskChallengeMarkerContent'

// Setup child components with necessary HOCs
const ChallengeResults = WithStatus(ChallengeResultList)
const ClusterMap = WithChallengeTaskClusters(
                      WithTaskClusterMarkers(TaskClusterMap('challenges')),
                      true)
const LocationFilter = WithCurrentUser(FilterByLocation)

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

  componentDidUpdate(prevProps) {
    if (!_isEqual(this.state.bounds, _get(this.props, 'mapBounds.bounds'))) {
      this.setState({bounds: _get(this.props, 'mapBounds.bounds'),
                     fromUserAction: _get(this.props, 'mapBounds.fromUserAction')})
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState)
  }

  render() {
    const challengeStatus = [ChallengeStatus.ready,
                             ChallengeStatus.partiallyLoaded,
                             ChallengeStatus.none,
                             ChallengeStatus.empty]

    const showMarkerPopup = (markerData) => {
      return (
       <Popup>
        <TaskChallengeMarkerContent
          marker={markerData}
          taskId={markerData.options.taskId}
          {...this.props}/>
       </Popup>
      )
    }

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
          <div className="mr-flex-0">
            <LocationFilter {...this.props} />
            <ChallengeResults {...this.props} />
          </div>
          <div className="mr-flex-1">
            <MapPane>
              <ClusterMap challenge={this.props.browsedChallenge}
                   showMarkerPopup={showMarkerPopup}
                   initialBounds={this.state.fromUserAction ? this.state.bounds : null}
                   criteria={{boundingBox: fromLatLngBounds(this.state.bounds),
                              zoom: this.state.zoom,
                              filters: _get(this.props, 'searchCriteria.filters'),
                              searchQuery: _get(this.props, 'searchCriteria.query'),
                              challengeStatus}}
                   updateTaskFilterBounds={(bounds, zoom, fromUserAction) => {
                     this.props.updateChallengeSearchMapBounds(bounds, fromUserAction)
                   }}
                   allowClusterToggle
                   showTaskCount
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
      WithClusteredTasks(
        WithMapBoundedTasks(
          WithFilteredChallenges(
            WithSearchResults(
              WithStartChallenge(
                WithBrowsedChallenge(injectIntl(ChallengePane))
              ),
              'challenges',
              'challenges'
            )
          )
        )
      )
    )
  )
