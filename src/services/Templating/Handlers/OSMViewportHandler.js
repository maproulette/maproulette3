import React from 'react'
import OSMViewportReference
       from '../../../components/OSMViewportReference/OSMViewportReference'


/**
 * Expands viewport shortcodes containing zoom/lat/lon to links to
 * OpenStreetMap, e.g. `[v/14/42.3824/12.2633]` would be expanded to
 * https://www.openstreetmap.org/#map=14/42.3824/12.2633
 *
 * For convenience, this will also handle the full OSM vewport URL, making its
 * display consistent with other viewport short-codes
 */
const OSMViewportHandler = {
  osmViewportRegex: "(v|viewport)[/ ]?(\\d+)\\/(-?[\\.\\d]+)\\/(-?[\\.\\d]+)",

  osmMapRegex: "https?://(www.openstreetmap.org)/?#map=(\\d+)\\/(-?[\\.\\d]+)\\/(-?[\\.\\d]+)",

  handlesShortCode(shortCode) {
    return new RegExp(this.osmViewportRegex).test(shortCode) ||
           new RegExp(this.osmMapRegex).test(shortCode)
  },

  expandShortCode(shortCode) {
    const viewport = new RegExp(this.osmViewportRegex).test(shortCode) ?
                     this.extractViewport(new RegExp(this.osmViewportRegex), shortCode) :
                     this.extractViewport(new RegExp(this.osmMapRegex), shortCode) 

    return viewport ? <OSMViewportReference {...viewport} /> : shortCode
  },

  extractViewport(regex, shortCode) {
    const match = regex.exec(shortCode.slice(1, -1))
    if (!match) {
      return null
    }

    return {
      zoom: match[2],
      lat: match[3],
      lon: match[4],
    }
  },
}

export default OSMViewportHandler
