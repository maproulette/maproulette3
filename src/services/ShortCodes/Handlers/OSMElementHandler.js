import React from 'react'
import OSMElementReference
       from '../../../components/OSMElementReference/OSMElementReference'


/**
 * Expands OSM element reference shortcodes to nodes, ways, and references,
 * e.g. for way 1234567: `[w/1234567]` or `[w1234567]` or `[w 1234567]` or
 * `[way/1234567]` or `[way1234567]` or `[way 1234567]`
 *
 * Multiple references can be included in a single short-code, separated by
 * commas: `[n123456789, w987654321]`
 *
 * Codes are expanded into links that either pull element data into JOSM (if
 * active) or else open a new browser tab to display them in Overpass Turbo
 */
const OSMElementHandler = {
  osmElementRegex: "(n|w|r|node|way|rel|relation)[/ ]?(\\d+)[,\\s]*",

  elementTypeMap: {
    'n': 'node',
    'node': 'node',
    'w': 'way',
    'way': 'way',
    'r': 'relation',
    'rel': 'relation',
    'relation': 'relation',
  },

  handlesShortCode(shortCode) {
    return new RegExp(this.osmElementRegex).test(shortCode)
  },

  expandShortCode(shortCode) {
    const matchedElements = []

    const regex = RegExp(this.osmElementRegex, 'g')
    let osmElementMatch = null
    while ((osmElementMatch = regex.exec(shortCode.slice(1, -1)))) {
      matchedElements.push({
        elementType: this.elementTypeMap[osmElementMatch[1]],
        osmId: osmElementMatch[2],
      })
    }

    return matchedElements.length > 0 ?
           <OSMElementReference osmElements={matchedElements} /> :
           shortCode
  }
}

export default OSMElementHandler
