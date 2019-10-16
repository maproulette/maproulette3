import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import WithEditor from '../HOCs/WithEditor/WithEditor'

/**
 * Renders a zoom/lat/lon viewport reference as an OSM map link but on click
 * will try to zoom JOSM to the viewport if that is the user's chosen editor --
 * otherwise will proceed to open OSM in a new browser tab
 */
export class OSMViewportReference extends PureComponent {
  zoomJOSMIfActive(clickEvent) {
    if (!this.props.isJosmEditor(this.props.configuredEditor)) {
      return
    }

    clickEvent.preventDefault()
    const bbox = this.props.viewportToBBox(this.props.zoom, this.props.lat, this.props.lon,
                                           window.innerWidth, window.innerHeight)
    this.props.zoomJOSM(bbox)
  }

  render() {
    const osmUrl =
      `https://www.openstreetmap.org/#map=${this.props.zoom}/${this.props.lat}/${this.props.lon}`

    return (
      <a
        href={osmUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={e => this.zoomJOSMIfActive(e)}
      >
        {this.props.zoom}/{this.props.lat}/{this.props.lon}
      </a>
    )
  }
}

OSMViewportReference.propTypes = {
  zoom: PropTypes.string.isRequired,
  lat: PropTypes.string.isRequired,
  lon: PropTypes.string.isRequired,
}

export default WithEditor(OSMViewportReference)
