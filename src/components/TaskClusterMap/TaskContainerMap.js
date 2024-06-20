import React, { useState } from 'react';
import classNames from 'classnames';
import { MapContainer } from 'react-leaflet';
import WithVisibleLayer from '../HOCs/WithVisibleLayer/WithVisibleLayer';
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer';
import WithIntersectingOverlays from '../HOCs/WithIntersectingOverlays/WithIntersectingOverlays';
import MapMarkers from './MapMarkers'
import { FormattedMessage } from 'react-intl';
import Messages from './Messages';
import AsMappableTask from '../../interactions/Task/AsMappableTask';

const VisibleTileLayer = WithVisibleLayer(SourcedTileLayer);


export const MAX_ZOOM = 18
export const MIN_ZOOM = 2

/**
 * An uncluster option will be offered if no more than this number of tasks
 * will be shown.
 */
export const UNCLUSTER_THRESHOLD = 1000 // max number of tasks

/**
 * The number of clusters to show.
 */
export const CLUSTER_POINTS = 25

/**
 * The size of cluster marker icons in pixels
 */
export const CLUSTER_ICON_PIXELS = 40

/**
 * TaskClusterMap allows a user to browse tasks and task clusters
 * geographically, optionally calling back when map bounds are modified
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const TaskClusterMap = (props) => {
    const [searchOpen, setSearchOpen] = useState(false)
    const [currentZoom, setCurrentZoom] = useState()
  
    const canClusterToggle = (
        props.allowClusterToggle &&
        props.totalTaskCount <= UNCLUSTER_THRESHOLD &&
        props.totalTaskCount > CLUSTER_POINTS &&
        currentZoom < MAX_ZOOM
    )
    const currentCenterpoint = AsMappableTask(props.task).calculateCenterPoint()

    return (
      <MapContainer
        bounds = {[[-70, -120], [80, 120]]}
        className={classNames('taskcluster-map', { 'full-screen-map': props.isMobile }, props.className)}
        >
        {canClusterToggle && !searchOpen && !props.loading &&
         <label htmlFor="show-clusters-input" className="mr-absolute mr-z-10 mr-top-0 mr-left-0 mr-mt-2 mr-ml-2 mr-shadow mr-rounded-sm mr-bg-black-50 mr-px-2 mr-py-1 mr-text-white mr-text-xs mr-flex mr-items-center">
           <input
             id="show-clusters-input"
             type="checkbox"
             className="mr-mr-2"
             checked={props.showAsClusters}
             onChange={() => {
               // Clear any existing selections when switching between tasks and clusters
               props.toggleShowAsClusters()
               props.resetSelectedClusters && props.resetSelectedClusters()
             }}
           />
           <FormattedMessage {...Messages.clusterTasksLabel} />
         </label>
        }
      <VisibleTileLayer {...props} zIndex={1} />
      <MapMarkers  {...props} allowSpidering currentZoom={currentZoom} setCurrentZoom={setCurrentZoom} />
    </MapContainer>
  );
};

export default searchName =>
      WithIntersectingOverlays(TaskClusterMap, searchName)
