import React from 'react'
import PropTypes from 'prop-types'
import L from 'leaflet'
import 'leaflet-vectoricon'
import { Marker } from 'react-leaflet'
import { getCoord } from '@turf/invariant'
import bearing from '@turf/bearing'
import midpoint from '@turf/midpoint'
import _isFinite from 'lodash/isFinite'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'

const colors = resolveConfig(tailwindConfig).theme.colors

/*
 * react-leaflet Marker with arrow icon that is rotated to indicate
 * directionality. If a heading and leaflet LatLng position are given, it will
 * be rendered with those. Alternatively, if betweenPoints is given with an
 * array of two GeoJSON Points, it will be rendered facing from point 1 towards
 * point 2 and can be automatically positioned at the midpoint between the two
 * if atMidpoint is given (otherwise the position prop will be used)
 */
export const DirectionalIndicationMarker = function(props) {
  if (_isFinite(props.heading)) {
    const icon = createDirectionalIndicatorIcon(props.heading, props.styles)
    return <Marker position={props.position} icon={icon} />
  }
  else if (props.betweenPoints) {
    const heading = bearing(props.betweenPoints[0], props.betweenPoints[1])
    const icon = createDirectionalIndicatorIcon(heading, props.styles)
    const position = props.atMidpoint ?
      getCoord(midpoint(props.betweenPoints[0], props.betweenPoints[1])) :
      props.position
    return <Marker position={{lon: position[0], lat: position[1]}} icon={icon} />
  }
  else {
    throw new Error("Either heading or betweenPoints props is required")
  }
}

DirectionalIndicationMarker.propTypes = {
  heading: PropTypes.number,
  betweenPoints: PropTypes.array,
  atMidpoint: PropTypes.bool,
}

export const createDirectionalIndicatorIcon = function(heading, styles={}) {
  const icon = L.vectorIcon({
    className: 'directional-marker-icon',
    viewBox: '0 0 20 20',
    svgHeight: 20,
    svgWidth: 20,
    type: 'path',
    shape: { // zondicons "arrow-thick-up" icon (shape must point north by default)
      d: "M7 10v8h6v-8h5l-8-8-8 8h5z",
    },
    style: {
      fill: colors.black,
      strokeWidth: 0,
      transform: `rotate(${heading} 10 10)`,
    }
  })

  return icon
}

export default DirectionalIndicationMarker
