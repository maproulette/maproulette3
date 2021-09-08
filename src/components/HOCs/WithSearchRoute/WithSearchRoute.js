import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _each from 'lodash/each'
import _debounce from 'lodash/debounce'
import queryString from 'query-string'
import { toLatLngBounds, fromLatLngBounds }
       from '../../../services/MapBounds/MapBounds'
import { SEARCH_TYPE_PROJECT } from '../../SearchTypeFilter/SearchTypeFilter'

/**
 * WithSearchRoute adds functionality to WithSearch to add/remove values to the URL route
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
export const WithSearchRoute = function(WrappedComponent, searchGroup) {
  class _WithSearchRoute extends Component {

    // Sets up the matching URL parameters to an appropriate function to call.
    // eg. 'sort=name' would call the function for 'sort' passing it the param
    // 'name'
    routeCriteria = {
       sort: param => this.props.setSearchSort({sortBy: param}),
       difficulty: param => this.props.setSearchFilters({difficulty: parseInt(param, 10)}),
       keywords: param => this.props.setKeywordFilter(param.split(',')),
       location: param => this.props.setSearchFilters({location: param}),
       project: param => this.props.setSearchFilters({project: param, searchType: SEARCH_TYPE_PROJECT}),
       query: param => this.props.setSearch(param),
       challengeSearch: param => this.props.setChallengeSearchMapBounds(toLatLngBounds(param), true),
       archived: param => this.props.setSearchFilters({ archived: param === "true" })
    }

    state = {
      loadedFromRoute: false,
    }

    componentDidMount() {
      // If we have not loaded all the paramters from the route then we need to.
      if (!this.state.loadedFromRoute) {
        this.setState({loadedFromRoute: true})

        if (!_isEmpty(this.props.history.location.search)) {
          if (this.props.clearSearchFilters) {
            // Clear any redux values first before setting the route criteria
            const routeValues = this.props.history.location.search
            this.props.clearSearchFilters(false)
            this.props.clearSearch(searchGroup)
            this.props.clearMapBounds(searchGroup)

            executeRouteSearch(this.routeCriteria, routeValues)
          }
        }
      }
    }

    setSearch = (query, searchName = searchGroup) => {
      this.props.setSearch(query, searchName)
      addSearchCriteriaToRoute(this.props.history, {query: `${query}`})
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

      const bounds = _get(this.props, `currentSearch.${searchGroup}.mapBounds.bounds`) ||
                     _get(this.props, `mapBounds.bounds`)
      updateBoundsOnRoute(this.props, searchGroup, bounds, filterCriteria.location, false)
    }

    removeSearchFilters = (criteriaNames) => {
      this.props.removeSearchFilters(criteriaNames)
      removeSearchCriteriaFromRoute(this.props.history, criteriaNames)

      // If we are removing the 'location' criteria then we don't need
      // the map bounds on the url route either.
      if (criteriaNames.indexOf('location') > -1) {
        removeSearchCriteriaFromRoute(this.props.history, ['challengeSearch'])
      }
    }

    setKeywordFilter = (keywords) => {
      this.props.setKeywordFilter(keywords)
      addSearchCriteriaToRoute(this.props.history, {keywords: keywords ? keywords.join(',') : keywords})
    }

    clearSearchFilters = (clearRoute = true) => {
      this.props.clearSearchFilters(clearRoute)
      clearRoute && this.props.history.push(this.props.history.location.pathname)
    }

    updateChallengeSearchMapBounds = (bounds, fromUserAction=false) => {
      this.props.setChallengeSearchMapBounds(bounds, fromUserAction)

      const locationFilter = _get(this.props, `currentSearch.${searchGroup}.filters.location`)
      updateBoundsOnRoute(this.props, searchGroup, bounds, locationFilter, true)
    }

    render() {
      return (
        <WrappedComponent {...this.props}
                            isLoading={this.props.isLoading || !this.state.loadedFromRoute}
                            loadedFromRouteDone={this.state.loadedFromRoute || _isEmpty(this.props.history.location.search)}
                            setSearch={this.setSearch}
                            clearSearch={this.clearSearch}
                            setSearchSort={this.setSearchSort}
                            setSearchFilters={this.setSearchFilters}
                            removeSearchFilters={this.removeSearchFilters}
                            setKeywordFilter={this.setKeywordFilter}
                            clearSearchFilters={this.clearSearchFilters}
                            updateChallengeSearchMapBounds={this.updateChallengeSearchMapBounds} />
       )
     }
  }

  _WithSearchRoute.propTypes = {
    isLoading: PropTypes.bool
  }

  _WithSearchRoute.defaultProps = {
    isLoading: true,
  }

  return _WithSearchRoute
}

export const executeRouteSearch = (routeCriteria, searchString) => {
  const searchCriteria = queryString.parse(searchString)
  _each(searchCriteria, (value, key) => {
    if (routeCriteria[key] && !_isEmpty(value)) {
      routeCriteria[key](value)
    }
  })
}

/**
 * Debounce browser history update to avoid Safari security error caused by
 * changing the history more than 100 times in 30 seconds if someone is really
 * going crazy with the search box
 */
export const debouncedUpdateHistory =
  _debounce((history, newPath) => history.replace(newPath), 500)

export const addSearchCriteriaToRoute = (history, newCriteria) => {
  const searchCriteria = queryString.parse(history.location.search)

  _each(newCriteria, (value, key) => {
    if (value === undefined) {
      delete searchCriteria[key]
    }
    else {
      searchCriteria[key] = value
    }
  })

  const newRoute = `${history.location.pathname}?${queryString.stringify(searchCriteria)}`
  debouncedUpdateHistory(history, newRoute)
}

export const updateBoundsOnRoute = (props, searchGroup, bounds, locationFilter, removeIfNeeded = true) => {
  // If our app is still loading then we don't want to mess with the URL route
  // and we only want to add the map bounds if they are relevant to the
  // challenge search results. (ie. 'withinMapBounds' or 'intersectingMapBounds')
  if (!props.isLoading && _get(props, `currentSearch.${searchGroup}`)) {
    if ( locationFilter === 'withinMapBounds' || locationFilter === 'intersectingMapBounds') {
      addBoundsToRoute(props.history, 'challengeSearch', bounds, locationFilter)
    }
    else if (removeIfNeeded) {
      removeSearchCriteriaFromRoute(props.history, ['challengeSearch'])
    }
  }
}

export const addBoundsToRoute = (history, boundsType, bounds, locationFilter) => {
  addSearchCriteriaToRoute(history,
    {[boundsType]: `${fromLatLngBounds(bounds).join(',')}`, location: locationFilter})
}

export const removeSearchCriteriaFromRoute = (history, criteriaKeys) => {
  const searchCriteria = queryString.parse(history.location.search)

  _each(criteriaKeys, key => {
    delete searchCriteria[key]
  })

  const newRoute = `${history.location.pathname}?${queryString.stringify(searchCriteria)}`
  history.replace(newRoute)
}

export default WithSearchRoute
