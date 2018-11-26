import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _startsWith from 'lodash/startsWith'
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

    /**
     * Executes the appropriate search type based on the start of
     * the query string
     */
    executeCommand = commandString => {
      if (_startsWith(commandString, 'm/') && commandString.length > 2) {
        const query = commandString.substr(2)
        let bounds = null

        // If four points are given then we have a bounding box
        if (_split(query, ',').length === 4) {
          bounds = _map(_split(query, ','), (point) => parseFloat(point))

        }
        // If only two points are given then we have a center point
        else if (_split(query, ',').length === 2) {
          const centerpoint = _map(_split(query, ','), (point) => parseFloat(point))
          bounds = this.determineBoundingBox(...centerpoint)
        }

        if (bounds) {
          // We need to clear the search first so that any string searches won't
          // be hanging around in redux
          this.props.clearSearch()
          this.props.setChallengeSearchMapBounds(bounds, 3, true)
        }
      }
      else {
        let query = commandString

        if (_startsWith(commandString, 's/') && commandString.length > 2) {
          query = commandString.substr(2)
        }

        // Standard search query
        this.props.setSearch(query)
      }

      this.setState({commandString})
    }

    clearSearch = commandString => {
      this.props.clearSearch()
      this.setState({commandString: null})
    }

    /**
    * Returns the bouding box from the given centerpoint coordinates
    */
    determineBoundingBox(centerpointLong, centerpointLat) {
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

    render() {
      return <WrappedComponent {..._omit(this.props, ['searchQuery', 'clearSearch',
                                          'executeSearch'])}
                               searchQuery={{query: this.state.commandString}}
                               executeSearch={this.executeCommand}
                               clearSearch={this.clearSearch} />
    }
  }
}

WithCommandInterpreter.propTypes = {
  /** Invoked to execute a search query with search text */
  setSearch: PropTypes.func,
  /** Invoked to execute a map bounds search */
  setChallengeSearchMapBounds: PropTypes.func,
  /** Invoked when the user clears the search text or changes search type */
  clearSearch: PropTypes.func.isRequired,
}

export default WithCommandInterpreter
