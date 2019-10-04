import React, { Component } from 'react'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _isEmpty from 'lodash/isEmpty'
import { getGeom } from '@turf/invariant'
import bboxPolygon from '@turf/bbox-polygon'
import booleanDisjoint from '@turf/boolean-disjoint'
import WithSearch from '../WithSearch/WithSearch'
import WithLayerSources from '../WithLayerSources/WithLayerSources'

export const WithIntersectingOverlays = function(WrappedComponent) {
  return class extends Component {
    render() {
      // Include all overlays by default. Narrow it down to intersecting ones
      // if we get valid map bounds.
      let includedOverlays = _filter(this.props.layerSources, {overlay: true})
      const mapBounds = _get(this.props, "mapBounds.bounds")

      if (mapBounds) {
        const boundsPoly = bboxPolygon([mapBounds.getWest(), mapBounds.getSouth(),
                                        mapBounds.getEast(), mapBounds.getNorth()])

        includedOverlays = _filter(includedOverlays, overlay => {
          if (_isEmpty(overlay.geometry)) { // no geometry indicates global layer
            return true
          }

          return !booleanDisjoint(boundsPoly, getGeom(overlay))
        })
      }

      return <WrappedComponent {...this.props} intersectingOverlays={includedOverlays} />
    }
  }
}

export default (WrappedComponent, mapBoundsField) => WithSearch(
    WithLayerSources(WithIntersectingOverlays(WrappedComponent)),
    mapBoundsField
  )
