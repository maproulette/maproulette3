import L from 'leaflet'
import 'leaflet-vectoricon'
import _isFunction from 'lodash/isFunction'
import _merge from 'lodash/merge'
import _cloneDeep from 'lodash/cloneDeep'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import _get from 'lodash/get'
import { TaskStatusColors }
      from '../../services/Task/TaskStatus/TaskStatus'
import { colors } from '../../tailwind'

const statusIcons = _fromPairs(_map(TaskStatusColors, (color, status) => [
 status,
 L.vectorIcon({
   className: 'location-marker-icon',
   viewBox: '0 0 20 20',
   svgHeight: 20,
   svgWidth: 20,
   type: 'path',
   shape: { // zondicons "location" icon
     d: "M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
   },
   style: {
     fill: color,
     stroke: colors['grey-leaflet'],
     strokeWidth: 0.5,
   },
   iconAnchor: [5, 15], // render tip of SVG near marker location
 })
]))

const primaryTaskStatusIcons = _cloneDeep(statusIcons)
const selectedTaskStatusIcons = _cloneDeep(statusIcons)


/**
 * AsMappableCluster adds functionality to a task cluster related to mapping,
 * such as generation of representative map marker objects suitable for Leaflet
 * maps
 */
export class AsMappableCluster {
  constructor(cluster) {
    Object.assign(this, cluster)
    this.rawData = cluster
  }

  /**
   * Generates a map marker object suitable for use with a Leaflet map, with
   * optionally customized appearance for the given map layer
   */
  mapMarker(monochromatic, selectedTasks, highlightPrimaryTask) {
    return {
      position: [this.point.lat, this.point.lng],
      options: {...(_merge(this.rawData, {taskStatus: this.rawData.status,
                                          taskPriority: this.rawData.priority,
                                          name: this.rawData.title,
                                          taskId: this.rawData.id}))},
      icon: this.leafletMarkerIcon(monochromatic, selectedTasks, highlightPrimaryTask),
    }
  }

  /**
   * Generates a Leaflet Icon object appropriate for the given cluster based on
   * its size, including using a standard marker for a single point
   */
  leafletMarkerIcon(monochromatic=false, selectedTasks, highlightPrimaryTask) {
    const count = _isFunction(this.rawData.getChildCount) ?
                  this.rawData.getChildCount() :
                  _get(this.options, 'numberOfPoints', this.numberOfPoints)
    if (count > 1) {
      const colorScheme = monochromatic ? 'greyscale-cluster' : 'multicolor-cluster'
      let clusterSizeClass = ''
      if (count < 10) {
        clusterSizeClass = 'few'
      }
      else if (count > 100) {
        clusterSizeClass = 'many'
      }

      return L.divIcon({
        html: `<span class="count">${count}</span>`,
        className: `${colorScheme} ${clusterSizeClass}`,
        iconSize: L.point(40, 40),
      })
    }
    else {
      const markerData = _merge(this.rawData, {taskStatus: this.rawData.status,
                                               taskPriority: this.rawData.priority,
                                               taskId: this.rawData.id})

      let icon = _cloneDeep(statusIcons[markerData.taskStatus] || statusIcons[0])

      if (highlightPrimaryTask && highlightPrimaryTask === markerData.taskId) {
        // Make marker for current task larger
        icon = _cloneDeep(primaryTaskStatusIcons[markerData.taskStatus])
        icon.options.svgHeight = 40
        icon.options.svgWidth = 40
        icon.options.style.fill = colors.yellow
        icon.options.iconAnchor = [5, 25] // adjust position of marker tip for larger size
      }
      else if (selectedTasks && selectedTasks.has(markerData.taskId)) {
        icon = _cloneDeep(selectedTaskStatusIcons[markerData.taskStatus])
        icon.options.style.fill = colors.yellow
      }
      icon.options.taskData = markerData

      return icon
    }
  }
}

export default cluster => new AsMappableCluster(cluster)
