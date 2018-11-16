import React, { Component } from 'react'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _trimStart from 'lodash/trimStart'
import _split from 'lodash/split'
import _each from 'lodash/each'
import _map from 'lodash/map'
import _join from 'lodash/join'
import _indexOf from 'lodash/indexOf'
import _isUndefined from 'lodash/isUndefined'
import { toLatLngBounds, fromLatLngBounds }
       from '../../../services/MapBounds/MapBounds'

/**
 * WithSearchRoute wraps WithSearch to add/remove values to the URL route
 * as criteria changes. Then when the app is loaded any criteria on the
 * route will be used to filter the challenge search shown.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 *
 * @see See WithSearch
 *
 * @param {WrappedComponent} WrappedComponent - The component to wrap
 * @param {string} searchGroup - The group name of the search criteria to work with
 */
const WithSearchRoute = (WrappedComponent, searchGroup) => {
  return _WithSearchRoute(WrappedComponent, searchGroup)
}

export const _WithSearchRoute = function(WrappedComponent, searchGroup) {
   const routeCriteria = {}
   const registerRouteCriteria = (key, functionToCall) => {
     routeCriteria[key] = functionToCall
   }

   return class extends Component {
    state = {
      loadedFromRoute: false,
    }

    constructor() {
      super()

      registerRouteCriteria('sort', param => this.props.setSearchSort({sortBy: param}))
      registerRouteCriteria('difficulty', param => this.props.setSearchFilters({difficulty: parseInt(param, 10)}))
      registerRouteCriteria('keywords', param => this.props.setKeywordFilter(_split(param, ',')))
      registerRouteCriteria('location', param => this.props.setSearchFilters({location: param}))
      registerRouteCriteria('query', param => this.props.setSearch(..._split(param, ":")))
      registerRouteCriteria('challengeSearch', param => callBoundsSet(param, this.props.setChallengeSearchMapBounds))
    }

    componentDidMount() {
      if (!this.state.loadedFromRoute) {
        this.setState({loadedFromRoute: true})
        if (!_isEmpty(this.props.history.location.search)) {
          if (this.props.clearSearchFilters) {
            const routeValues = this.props.history.location.search
            this.props.clearSearchFilters(false)
            this.props.clearSearch(searchGroup)
            this.props.clearMapBounds(searchGroup)
            executeRouteSearch(routeCriteria, routeValues)
          }
        }
      }
    }

    setSearch = (query, searchName = searchGroup) => {
      this.props.setSearch(query, searchName)
      addSearchCriteriaToRoute(this.props.history, {query: `${query}:${searchName}`})
    }

    clearSearch = (searchName = searchGroup) => {
      this.props.clearSearch(searchName)
      removeSearchCriteriaFromRoute(this.props.history, ['query'])
    }

    setSearchSort = (sortCriteria) => {
      this.props.setSearchSort(sortCriteria)
      addSearchCriteriaToRoute(this.props.history, {sort: _get(sortCriteria, 'sortBy')})
    }

    setSearchFilters = (filterCriteria) => {
      this.props.setSearchFilters(filterCriteria)
      addSearchCriteriaToRoute(this.props.history, filterCriteria)

      const isLoading = _isUndefined(this.props.isLoading) ? true : this.props.isLoading
      if (searchGroup === "challenges" && !isLoading) {
        if (filterCriteria.location === 'withinMapBounds' ||
            filterCriteria.location === 'intersectingMapBounds') {
          if (_get(this.props, `currentSearch.${searchGroup}`)) {
            const bounds = _get(this.props, `currentSearch.${searchGroup}.mapBounds.bounds`)
            const zoom = _get(this.props, `currentSearch.${searchGroup}.mapBounds.zoom`)
            addBoundsToRoute(this.props.history, 'challengeSearch', bounds, zoom)
          }
        }
      }
    }

    removeSearchFilters = (criteriaNames) => {
      this.props.removeSearchFilters(criteriaNames)
      removeSearchCriteriaFromRoute(this.props.history, criteriaNames)

      if (_indexOf(criteriaNames, 'location') > -1) {
        removeSearchCriteriaFromRoute(this.props.history, ['challengeSearch'])
      }
    }

    setKeywordFilter = (keywords) => {
      this.props.setKeywordFilter(keywords)
      addSearchCriteriaToRoute(this.props.history, {keywords: _join(keywords, ',')})
    }

    clearSearchFilters = (clearRoute = true) => {
      this.props.clearSearchFilters(clearRoute)
      clearRoute && this.props.history.push(`${this.props.history.location.pathname}`)
    }

    setChallengeSearchMapBounds = (bounds, zoom, fromUserAction=false) => {
      this.props.setChallengeSearchMapBounds(bounds, zoom, fromUserAction)

      // Only update the route if the map bounds would impact the search
      const isLoading = _isUndefined(this.props.isLoading) ? true : this.props.isLoading
      if (!isLoading && searchGroup === "challenges" && _get(this.props, `currentSearch.${searchGroup}`)) {
        if (_get(this.props, `currentSearch.${searchGroup}.filters.location`) === 'withinMapBounds' ||
            _get(this.props, `currentSearch.${searchGroup}.filters.location`) === 'intersectingMapBounds') {
          addBoundsToRoute(this.props.history, 'challengeSearch', bounds, zoom)
        }
        else {
          removeSearchCriteriaFromRoute(this.props.history, ['challengeSearch'])
        }
      }
    }

    render() {
      return (
        <WrappedComponent {...this.props}
                            isLoading={this.props.isLoading || !this.state.loadedFromRoute}
                            setSearch={this.setSearch}
                            clearSearch={this.clearSearch}
                            setSearchSort={this.setSearchSort}
                            setSearchFilters={this.setSearchFilters}
                            removeSearchFilters={this.removeSearchFilters}
                            setKeywordFilter={this.setKeywordFilter}
                            clearSearchFilters={this.clearSearchFilters}
                            setChallengeSearchMapBounds={this.setChallengeSearchMapBounds} />
       )
     }
   }
}

export const executeRouteSearch = (routeCriteria, searchString) => {
  const searchCriteria = parseRouteSearch(searchString)
  _each(searchCriteria, (value, key) => {
    routeCriteria[key](value)
  })
}

export const callBoundsSet = (param, functionToCall) => {
  const boundsZoom = _split(param, ":")
  const bounds = _split(boundsZoom[0], ',')
  const zoom = parseInt(boundsZoom[1], 10)

  if (bounds && bounds.length === 4) {
    functionToCall(toLatLngBounds(bounds), zoom, true)
  }
  else {
    // Invalid Bounds given
  }
}

export const parseRouteSearch = (searchString) => {
  const searchCriteria = {}
  const queryString = _trimStart(searchString, '?')
  if (!_isEmpty(queryString)) {
    _each(_split(queryString, '&'), pair => {
      const result = _split(pair, '=')
      searchCriteria[result[0]] = result[1]
    })
  }

  return searchCriteria
}

export const addSearchCriteriaToRoute = (history, newCriteria) => {
  const searchCriteria = parseRouteSearch(history.location.search)

  _each(newCriteria, (value, key) => {
    if (value === undefined) {
      delete searchCriteria[key]
    }
    else {
      searchCriteria[key] = value
    }
  })

  const newRoute = _join(_map(searchCriteria, (value, key) => `${key}=${value}`), '&')
  history.replace(`${history.location.pathname}?${newRoute}`)
}

export const addBoundsToRoute = (history, boundsType, bounds, zoom) => {
  addSearchCriteriaToRoute(history,
    {[boundsType]: `${_join(fromLatLngBounds(bounds), ',')}:${zoom}`})
}

export const removeSearchCriteriaFromRoute = (history, criteriaKeys) => {
  const searchCriteria = parseRouteSearch(history.location.search)

  _each(criteriaKeys, key => {
    delete searchCriteria[key]
  })

  const newRoute = _join(_map(searchCriteria, (value, key) => `${key}=${value}`), '&')
  history.replace(`${history.location.pathname}?${newRoute}`)
}

export default WithSearchRoute
