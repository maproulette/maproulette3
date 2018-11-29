import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _split from 'lodash/split'
import _map from 'lodash/map'
import _omit from 'lodash/omit'

/**
 * WithCommandInterpreter interprets search strings to
 * determine what action should be performed.
 *
 * Supported Actions:
 *    m/  => Execute a map bounds search with either a bounding box or a centerpoint
 *    s/ or default => Execute a standard search query
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithCommandInterpreter = function(WrappedComponent) {
  return class extends Component {
    state = {
      commandString: null,
    }

    executeSearch = commandString => {
      executeCommand(this.props, commandString)
      this.setState({commandString})
    }

    clearSearch = commandString => {
      this.props.clearSearch()
      this.setState({commandString: null})
    }

    render() {
      return <WrappedComponent {..._omit(this.props, ['searchQuery', 'clearSearch',
                                          'executeSearch'])}
                               searchQuery={{query: this.state.commandString}}
                               setSearch={this.executeSearch}
                               clearSearch={this.clearSearch} />
    }
  }
}

/**
 * Executes the appropriate search type based on the start of
 * the query string
 */
export const executeCommand = (props, commandString) => {
  const command = commandString.length > 2 ? commandString.substring(0, 2) : null
  let query = commandString.substring(2)

  switch(command) {
    case 'm/':
      let bounds = null

      // If four points are given then we have a bounding box
      if (_split(query, ',').length === 4) {
        bounds = _map(_split(query, ','), (point) => parseFloat(point))

      }
      // If only two points are given then we have a center point
      else if (_split(query, ',').length === 2) {
        const centerpoint = _map(_split(query, ','), (point) => parseFloat(point))
        bounds = determineBoundingBox(...centerpoint)
      }

      if (bounds) {
        // We need to clear the search first so that any string searches won't
        // be hanging around in redux
        props.clearSearch()
        props.updateChallengeSearchMapBounds(bounds, true)
      }
      break;
    case 's/':
    default:
      if (command !== 's/') {
        query = commandString
      }

      // Standard search query
      props.setSearch(query)
      break;
  }
}

/**
* Returns the bouding box from the given centerpoint coordinates
*/
const determineBoundingBox = (centerpointLong, centerpointLat) => {
  const bboxWidth = parseFloat(process.env.REACT_APP_NEARBY_LONGITUDE_LENGTH)
  const bboxHeight = parseFloat(process.env.REACT_APP_NEARBY_LATITUDE_LENGTH)

  // Build WSEN bounds array
  return ([
    centerpointLong - (bboxWidth / 2.0),
    centerpointLat - (bboxHeight / 2.0),
    centerpointLong + (bboxWidth / 2.0),
    centerpointLat + (bboxHeight / 2.0)
  ])
}

WithCommandInterpreter.propTypes = {
  /** Invoked to execute a search query with search text */
  setSearch: PropTypes.func,
  /** Invoked to execute a map bounds search */
  updateChallengeSearchMapBounds: PropTypes.func,
  /** Invoked when the user clears the search text or changes search type */
  clearSearch: PropTypes.func.isRequired,
}

export default WithCommandInterpreter
