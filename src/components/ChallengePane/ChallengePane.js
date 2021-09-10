import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import _uniqBy from 'lodash/uniqBy'
import _differenceBy from 'lodash/differenceBy'
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
import StartVirtualChallenge from './StartVirtualChallenge/StartVirtualChallenge'

const ShowArchivedToggleInternal = (props) => {
  return (
    <div className="mr-flex">
      <input
        type="checkbox"
        className="mr-checkbox-toggle mr-mr-1 mr-mb-6"
        checked={props.showingArchived}
        onChange={() => {
          props.setSearchFilters({ archived: !props.showingArchived })
        }}
      />
      <div className="mr-text-sm mr-mx-1">Show Archived</div>
    </div>
  )
}

const ShowArchivedToggle = WithChallengeSearch(ShowArchivedToggleInternal);

// Setup child components with necessary HOCs
const ChallengeResults = WithStatus(ChallengeResultList)
const ClusterMap =
  WithChallengeTaskClusters(
    WithTaskClusterMarkers(
      WithCurrentUser(
        TaskClusterMap('challenges')
      )
    ),
    true
  )
const LocationFilter = WithCurrentUser(FilterByLocation)

/**
 * ChallengePane represents the top-level view when the user is browsing,
 * searching, and choosing a challenge to start working on. It includes
 * a ChallengeFilterSubnav that presents a subnav with filter and search
 * options, a ChallengeResultList (wrapped in a Sidebar) for presenting challenges
 * that match the current search and set of filters, and a ChallengeSearchMap for
 * finding challenges geographically.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengePane extends Component {
  state = {
    selectedClusters: []
  }

  onBulkClusterSelection = clusters => {
    if (!clusters || clusters.length === 0) {
      return
    }

    // Handle both clusters and individual tasks in case user declustered
    this.setState({
      selectedClusters: _uniqBy(
        this.state.selectedClusters.concat(clusters), clusters[0].isTask ? 'taskId' : 'clusterId'
      ),
    })
  }

  onBulkClusterDeselection = clusters => {
    if (!clusters || clusters.length === 0) {
      return
    }

    // Handle both clusters and individual tasks in case user declustered
    this.setState({
      selectedClusters: _differenceBy(
        this.state.selectedClusters, clusters, clusters[0].isTask ? 'taskId' : 'clusterId'
      ),
    })
  }

  resetSelectedClusters = () => this.setState({selectedClusters: []})

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
    const showingArchived = this.props.history.location.search.includes("archived=true");
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

    const virtualChallengeMapOverlay =
      this.state.selectedClusters.length > 0 ?
      <StartVirtualChallenge
        {...this.props}
        selectedClusters={this.state.selectedClusters}
      /> :
      null

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
            <ShowArchivedToggle showingArchived={showingArchived} {...this.props} />
            <ChallengeResults {...this.props} />
          </div>
          <div className="mr-flex-1">
            <MapPane>
              <ClusterMap
                challenge={this.props.browsedChallenge}
                showMarkerPopup={showMarkerPopup}
                initialBounds={this.state.fromUserAction ? this.state.bounds : null}
                criteria={{boundingBox: fromLatLngBounds(this.state.bounds),
                          zoom: this.state.zoom,
                          filters: _get(this.props, 'searchCriteria.filters'),
                          searchQuery: _get(this.props, 'searchCriteria.query'),
                          challengeStatus}}
                updateTaskFilterBounds={(bounds, zoom, fromUserAction) => {
                  this.props.updateChallengeSearchMapBounds(bounds, fromUserAction)
                  this.resetSelectedClusters()
                }}
                selectedClusters={this.state.selectedClusters}
                onBulkClusterSelection={this.onBulkClusterSelection}
                onBulkClusterDeselection={this.onBulkClusterDeselection}
                resetSelectedClusters={this.resetSelectedClusters}
                allowClusterToggle
                showTaskCount
                showClusterLasso
                showFitWorld
                externalOverlay={virtualChallengeMapOverlay}
                {...this.props}
              />
            </MapPane>
          </div>
        </div>
      </div>
    )
  }
}

export default
  WithCurrentUser(
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
  )
