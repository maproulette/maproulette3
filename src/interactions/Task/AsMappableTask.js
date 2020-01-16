import { getType } from '@turf/invariant'
import { point } from '@turf/helpers'
import center from '@turf/center'
import bbox from '@turf/bbox'
import nearestPointOnLine from '@turf/nearest-point-on-line'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _pick from 'lodash/pick'
import _every from 'lodash/every'
import _cloneDeep from 'lodash/cloneDeep'
import { latLng } from 'leaflet'
import AsIdentifiableFeature from '../TaskFeature/AsIdentifiableFeature'
import { supportedSimplestyles } from '../TaskFeature/AsSimpleStyleableFeature'

/**
 * AsMappableTask adds functionality to a Task related to mapping.
 */
export class AsMappableTask {
  constructor(task) {
    Object.assign(this, task)
  }

  /**
   * Determines if this task contains geometries with features and returns
   * true if so, false if not.
   */
  hasGeometries() {
    if (!_isObject(this.geometries)) {
      return false
    }

    // There are some tasks that have a FeatureCollection with null features,
    // so check for that here.
    if (this.geometries.type === 'FeatureCollection' &&
        !_isArray(this.geometries.features)) {
      return false
    }

    return true
  }

  /**
   * Determines if the geometry features are all of the given feature
   * type or types (can be a string or array of multiple strings)
   */
  isFeatureType(allowedFeatureTypes) {
    if (!this.hasGeometries()) {
      return false
    }

    const allowedTypes = _isArray(allowedFeatureTypes) ?
                         allowedFeatureTypes : [allowedFeatureTypes]

    return _every(this.geometries.features, feature =>
      allowedTypes.indexOf(getType(feature)) !== -1
    )
  }

  /**
   * Generates a single object containing all feature properties found in the
   * task's geometries. Later properties will overwrite earlier properties with
   * the same name.
   */
  allFeatureProperties(features) {
    if (!this.hasGeometries()) {
      return []
    }

    if (!features) {
      features = this.geometries.features
    }

    let allProperties = {}

    features.forEach(feature => {
      if (feature && feature.properties) {
        allProperties = Object.assign(allProperties, feature.properties)
      }
    })

    return allProperties
  }

  /**
   * Similar to allFeatureProperties, but uses current OSM tags for the feature
   * properties. If OSM data isn't available, falls back to default behavior of
   * allFeatureProperties
   */
  osmFeatureProperties(osmElements) {
    if (!this.hasGeometries()) {
      return []
    }

    if (!osmElements || osmElements.size === 0) {
      return this.allFeatureProperties()
    }

    return this.allFeatureProperties(
      this.featuresWithTags(this.geometries.features, osmElements, true, supportedSimplestyles)
    )
  }

  /**
   * Returns the task centerpoint as (lng, lat), calculating it if necessary
   * (and possible). If the centerpoint can't be determined it will default to
   * (0, 0)
   */
  rawCenterPoint() {
    let centerPoint = _get(this, 'location.coordinates')

    if (!centerPoint && _isObject(this.point)) {
      centerPoint = [this.point.lng, this.point.lat]
    }

    // Not all tasks have a center-point. In that case, we try to calculate
    // one ourselves based on the task features.
    if (!centerPoint && this.hasGeometries()) {
      try {
        centerPoint = _get(center(this.geometries), 'geometry.coordinates')
      }
      catch(e) {} // Bad geometry can cause turf to blow up
    }

    // If all our efforts failed, default to (0, 0).
    if (!centerPoint) {
      centerPoint = [0, 0]
    }

    return centerPoint
  }

  /**
   * Returns the task centerpoint as a leaflet LatLng object, calculating it if
   * necessary (and possible). If the centerpoint can't be determined it will
   * default to (0, 0)
   */
  calculateCenterPoint() {
    const centerPoint = this.rawCenterPoint()

    // The raw centerpoint is (Lng, Lat), but Leaflet maps want (Lat, Lng)
    return latLng(centerPoint[1], centerPoint[0])
  }

  /**
   * For tasks with LineString or MultiLineString geometry, returns the point
   * along the line nearest to the task's computed centerpoint. Otherwise the
   * centerpoint is simply returned as a GeoJSON Point object
   */
  nearestPointToCenter() {
    const centerPoint = this.rawCenterPoint()

    if (this.isFeatureType(['LineString', 'MultiLineString'])) {
      try {
        return nearestPointOnLine(this.normalizedGeometries(), centerPoint)
      }
      catch(e) {} // Bad geometry can cause turf to blow up
    }

    return point(centerPoint)
  }

  /**
   * If possible, repair common problems with geometries, such as a missing
   * FeatureCollection type
   */
  normalizedGeometries() {
    if (_isArray(this.geometries.features) && !this.geometries.type) {
      return Object.assign({type: "FeatureCollection"}, this.geometries)
    }

    return this.geometries
  }

  /**
   * Calculates and returns the bounding box of the task.
   */
  calculateBBox() {
    try {
      if (this.hasGeometries()) {
        return bbox(this.geometries)
      }
    }
    catch(e) {} // Bad geometry can cause turf to blow up

    // Fall back to task centerpoint
    const centerPoint = this.calculateCenterPoint()
    return bbox(point([centerPoint.lng, centerPoint.lat]))
  }

  /**
   * Clones the given features, returning a new array of features with their
   * properties replaced with the tag data from the given osmElements. If
   * includeId is true then an `@id` property will also be included. Features
   * with no id or no data in osmElements will be returned with their original
   * property set. Specific original properties can also be preserved by
   * including their names in the preserveProperties array
   */
  featuresWithTags(features, osmElements, includeId=true, preserveProperties=[]) {
    return _map(features, originalFeature => {
      const feature = _cloneDeep(originalFeature)
      const elementId = AsIdentifiableFeature(feature).rawFeatureId()
      if (!elementId || !osmElements.has(elementId)) {
        // No id or no data for id, so return feature as-is
        return feature
      }

      feature.properties = Object.assign(
        includeId ? {'@id': elementId} : {},
        this.tagsObjectFor(elementId, osmElements),
        _pick(originalFeature.properties, preserveProperties)
      )

      return feature
    })
  }

  /**
   * Generates an object representation of the tags for the specified OSM
   * element id (e.g. "way/123456789") based on the data from osmElements.
   * Returns null if osmElements does not contain data for the given id
   *
   * @private
   */
  tagsObjectFor(elementId, osmElements) {
    if (!osmElements.has(elementId)) {
      return null
    }

    return _fromPairs(
      _map(osmElements.get(elementId).tag, tag => [tag.k, tag.v])
    )
  }
}

export default task => new AsMappableTask(task)
