import React, { Component } from 'react'
import PropTypes from 'prop-types'

import _split from 'lodash/split'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _debounce from 'lodash/debounce'
import { fetchPlaceLocation } from '../../../services/Place/Place'
import WithErrors from '../WithErrors/WithErrors'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithCommandInterpreter interprets search strings to
 * determine what action should be performed.
 *
 * Supported Actions:
 *    m/  => Execute a map bounds search with either a bounding box or a centerpoint
 *    n/  => Execute a nominatim search and move map bounds
 *    s/ or default => Execute a standard search query
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithCommandInterpreter = function(WrappedComponent) {
  return class extends Component {
    state = {
      commandString: null,
      searchActive: true,
      mapLoading: false,
    }

    executeSearch = commandString => {
      if (this.state.searchActive || commandString.length <= 2) {
        const wasStandardSearch = executeCommand(this.props, commandString)
        this.setState({commandString, searchActive: wasStandardSearch})
      }
      else {
        this.setState({commandString})
      }
    }

    clearSearch = commandString => {
      this.props.clearSearch()
      this.setState({commandString: null, searchActive: true})
    }

    deactivate = () => {
      executeCommand(this.props, this.state.commandString, (loading) => this.setState({mapLoading: loading}))
    }

    render() {
      const query = this.state.commandString ? this.state.commandString : this.props.searchGroup ?
        _get(this.props, `searchQueries.${this.props.searchGroup}.searchQuery.query`) :
        _get(this.props, 'searchQuery.query')

      const loading = _get(this.props, 'searchQuery.meta.fetchingResults') || this.state.mapLoading

      return <WrappedComponent {..._omit(this.props, ['searchQuery', 'clearSearch',
                                          'executeSearch', 'searchGroup'])}
                               searchQuery={{query: query, meta: {fetchingResults: loading}}}
                               setSearch={this.executeSearch}
                               clearSearch={this.clearSearch}
                               showDoneButton={!this.state.searchActive}
                               deactivate={this.deactivate} />
    }
  }
}

/**
 * Executes the appropriate search type based on the start of
 * the query string
 *
 * @return boolean - Whether this was a typical search or a command search
 */
export const executeCommand = (props, commandString, setLoading) => {
  const command = commandString.length >= 2 ? commandString.substring(0, 2) : null
  let query = commandString.substring(2)

  switch(command) {
    case 'm/':
      props.setSearch("")  // We need to clear the initial 'm' from the query
      if (query.length > 0) {
        debouncedMapSearch(props, query, setLoading)
      }
      return false
    case 'n/':
      props.setSearch("") // We need to clear the initial 'n' from the query
      if (query.length > 0) {
        debouncedPlaceSearch(props, query, setLoading)
      }
      return false
    case 's/':
    default:
      if (command !== 's/') {
        query = commandString
      }

      // Standard search query
      props.setSearch(query)
      return true
  }
}

const debouncedMapSearch =
    _debounce((props, query, setLoading) => executeMapSearch(props, query, setLoading), 1000, {leading: false})

const debouncedPlaceSearch =
    _debounce((props, query, setLoading) => executePlaceSearch(props, query, setLoading), 1000, {leading: false})

/**
 * Executes the map search
 */
export const executeMapSearch = (props, query, setLoading) => {
  let bounds = null

  // If four points are given then we have a bounding box
  if (_split(query, ',').length === 4) {
    const querySplit = _split(query, ',')

    // Check if every element is a valid number
    const boundsInvalid = _find(querySplit, point => (point === "" || isNaN(point))) !== undefined

    if (!boundsInvalid) {
      bounds = _map(querySplit, (point) => parseFloat(point))
    }
  }
  // If only two points are given then we have a center point
  else if (_split(query, ',').length === 2) {
    const querySplit = _split(query, ',')

    // Check if every element is a valid number
    const boundsInvalid = _find(querySplit, point => (point === "" || isNaN(point))) !== undefined

    if (!boundsInvalid) {
      bounds = determineBoundingBox(..._map(querySplit, (point) => parseFloat(point)))
    }
  }

  // It might be a string place -- let's ask Nominatim for it's location
  if (!bounds) {
    executePlaceSearch(props, query, setLoading)
  }
  else {
    setLoading(true)

    // We need to clear the search first so that any string searches won't
    // be hanging around in redux
    props.clearSearch()
    props.updateChallengeSearchMapBounds(bounds, true)

    setLoading(false)
  }
}

/**
 * Executes a Place map search
 */
export const executePlaceSearch = (props, query, setLoading) => {
  setLoading(true)
  fetchPlaceLocation(query).then(boundingBox => {
    setLoading(false)
    if (boundingBox) {
      props.updateChallengeSearchMapBounds(boundingBox, true)
    }
    else {
      props.addError(AppErrors.map.placeNotFound)
    }
  })
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

export default WrappedComponent =>
  WithErrors(WithCommandInterpreter(WrappedComponent))
