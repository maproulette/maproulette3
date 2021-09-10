import React, { Component } from 'react'
import { connect } from 'react-redux'
import _debounce from 'lodash/debounce'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isFunction from 'lodash/isFunction'
import _isEmpty from 'lodash/isEmpty'
import _isEqual from 'lodash/isEqual'
import _includes from 'lodash/includes'
import { SORT_NAME, SORT_CREATED, SORT_OLDEST, SORT_POPULARITY, SORT_COOPERATIVE_WORK, SORT_COMPLETION, SORT_TASKS_REMAINING,
         setSort, removeSort, setPage,
         setFilters, removeFilters, clearFilters,
         setSearch, clearSearch,
         setChallengeSearchMapBounds,
         setTaskMapBounds, setChallengeOwnerMapBounds, clearMapBounds,
         performSearch }
       from '../../../services/Search/Search'
import { addError } from '../../../services/Error/Error'
import { toLatLngBounds, DEFAULT_MAP_BOUNDS }
       from '../../../services/MapBounds/MapBounds'
import WithUserLocation from '../WithUserLocation/WithUserLocation'

/**
 * WithSearch passes down search criteria from the redux
 * store to the wrapped component, and also provides functions for altering and
 * removing search criteria. It works with the Search service to provide wrapped components
 * with the named search query text as well as functions for updating and
 * clearing the query text, the sort parameters, and the filters.
 *
 * > Note that WithSearch does not provide any search results, only
 * > facilities for managing the search criteria itself.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 *
 * @see See WithSearchResults for a HOC that provides results for a named search
 *
 * @param {WrappedComponent} WrappedComponent - The component to wrap
 * @param {string} searchGroup - The group name of the search criteria to work with
 * @param {function} searchFunction - which function to call when performing a search
 */
const WithSearch = (WrappedComponent, searchGroup, searchFunction) => {
  // Debounce the search function so the server doesn't get hammered as a user
  // types in a query string
  const debouncedSearch = searchFunction ?
    _debounce(props => props.performSearch(props.searchCriteria, searchFunction, props),
              1000, {leading: false}) : null

  return WithUserLocation(
    connect(
      (state) => mapStateToProps(state, searchGroup),
      (state, ownProps) => mapDispatchToProps(state, ownProps, searchGroup)
    )(_WithSearch(WrappedComponent, searchGroup, debouncedSearch), searchGroup)
  )
}

export const _WithSearch = function(WrappedComponent, searchGroup, searchFunction) {
   return class extends Component {
    setSearch = query => this.props.setSearch(query, searchGroup)
    clearSearch = () => this.props.clearSearch(searchGroup)

    componentDidUpdate(prevProps) {
      // do nothing if no search function is given
      if (!searchFunction) {
        return
      }

      let prevSearch = _omit(_get(prevProps, `currentSearch.${searchGroup}`), ['meta'])
      let currentSearch = _omit(_get(this.props, `currentSearch.${searchGroup}`), ['meta'])

      if (!_get(this.props, 'searchFilters.location')) {
        currentSearch = _omit(currentSearch, 'mapBounds')
        prevSearch = _omit(prevSearch, 'mapBounds')
      }

      if (!_isEqual(prevSearch, currentSearch)) {
        searchFunction(this.props)
      }
    }

    render() {
       // Merge our search query in with others in case there are multiple
       // searches in play.
       const searchQueries =
         Object.assign({}, _get(this.props, 'searchQueries', {}), {
           [searchGroup]: {
             searchQuery: _get(this.props, `currentSearch.${searchGroup}`),
             setSearch: this.setSearch,
             clearSearch: this.clearSearch,
           }
       })

       const isLoading = _get(this.props, `currentSearch.${searchGroup}.meta.fetchingResults`) != null

       return (
          <WrappedComponent searchGroup={searchGroup}
                            searchQueries={searchQueries}
                            searchFunction={searchFunction}
                            isLoading={isLoading}
                            {...searchQueries[searchGroup]}
                            {..._omit(this.props, ['searchQueries',
                                                   'setSearch', 'clearSearch',
                                                   'performSearch',
                                                   'searchFunction'])} />
       )
     }
   }
}

export const mapStateToProps = (state, searchGroup) => {
  return {
    currentSearch: _get(state, 'currentSearch'),
    searchCriteria: _get(state, `currentSearch.${searchGroup}`),
    searchFilters: _get(state, `currentSearch.${searchGroup}.filters`, {}),
    searchSort: _get(state, `currentSearch.${searchGroup}.sort`, {}),
    searchPage: _get(state, `currentSearch.${searchGroup}.page`, {}),
    mapBounds: convertBounds(_get(state, `currentSearch.${searchGroup}.mapBounds`,
                                  {bounds: DEFAULT_MAP_BOUNDS})),
  }
}

export const mapDispatchToProps = (dispatch, ownProps, searchGroup) => ({
  performSearch: (query, searchFunction, props) => {
    return dispatch(performSearch(searchGroup, query, searchFunction, props))
  },

  setSearch: (query, searchName) => {
    dispatch(setSearch(searchName, query))

    // If multiple WithSearch HOCs are chained, invoke parent searches
    // as well. The assumption is that they are configured to search
    // different entities (e.g. one searches projects and the other
    // searches challenges)
    if (_isFunction(ownProps.setSearch)) {
      ownProps.setSearch(query, searchName)
    }
  },

  clearSearch: searchName => {
    dispatch(clearSearch(searchName))

    // If multiple WithSearch HOCs are chained, pass it up
    if (_isFunction(ownProps.clearSearch)) {
      ownProps.clearSearch(searchName)
    }
  },

  setSearchSort: (sortCriteria) => {
    const sortBy = _get(sortCriteria, 'sortBy')
    let sort = null

    switch(sortBy) {
      case SORT_NAME:
        sort = {sortBy, direction: 'asc'}
        break
      case SORT_CREATED:
        sort = {sortBy, direction: 'desc'}
        break
      case SORT_OLDEST:
        sort = {sortBy, direction: 'asc'}
        break
      case SORT_COMPLETION:
        sort = {sortBy, direction: 'desc'}
        break
      case SORT_TASKS_REMAINING:
        sort = {sortBy, direction: 'asc'}
        break
      case SORT_POPULARITY:
        sort = {sortBy, direction: 'desc'}
        break
      case SORT_COOPERATIVE_WORK:
        sort = {sortBy, direction: 'desc'}
        break
      default:
        sort = {sortBy: null, direction: null}
        break
    }

    dispatch(setSort(searchGroup, sort))
  },

  removeSearchSort:
    criteriaNames => dispatch(removeSort(searchGroup, criteriaNames)),

  setSearchPage: (page, applyToSearchGroups = null) => {
    // Only call setPage if it applies to the correct search group
    if (applyToSearchGroups === null || _includes(applyToSearchGroups, searchGroup)) {
      dispatch(setPage(searchGroup, page))
    }

    // If multiple WithSearch HOCs are chained, invoke parent setSearchPage
    // as well. The assumption is that they are configured to page
    // different entities (e.g. one pages projects and the other
    // pages challenges). We want to pass through the search groups that
    // we want setSearchPage to apply to.
    if (_isFunction(ownProps.setSearchPage)) {
      ownProps.setSearchPage(page, applyToSearchGroups)
    }
  },

  setSearchFilters: filterCriteria => {
    dispatch(setFilters(searchGroup, filterCriteria))
  },

  removeSearchFilters: criteriaNames => {
    dispatch(removeFilters(searchGroup, criteriaNames))
  },

  setKeywordFilter: keywords => {
    dispatch(setFilters(searchGroup, {keywords}))
  },

  clearSearchFilters: (clearRoute = true) => {
    dispatch(clearFilters(searchGroup))
  },

  setChallengeSearchMapBounds: (bounds, fromUserAction=false) => {
    dispatch(setChallengeSearchMapBounds(searchGroup, bounds, fromUserAction))
  },

  setChallengeOwnerMapBounds: (challengeId, bounds, zoom) => {
    dispatch(setChallengeOwnerMapBounds(searchGroup, challengeId, bounds, zoom))
  },

  setTaskMapBounds: (taskId, bounds, zoom, fromUserAction=false) => {
    dispatch(setTaskMapBounds(searchGroup, taskId, bounds, zoom, fromUserAction))
  },

  clearMapBounds: () => {
    dispatch(clearMapBounds(searchGroup))
  },

  locateMapToUser: user => {
    return ownProps.getUserBounds(user).then(userBounds => {
      dispatch(setChallengeSearchMapBounds(searchGroup, userBounds, true))
    }).catch(locationError => {
      dispatch(addError(locationError))
    })
  },
})

const convertBounds = boundsObject => {
  if (_isEmpty(boundsObject) || _isEmpty(boundsObject.bounds)) {
    return boundsObject
  }

  return Object.assign(
    {},
    boundsObject,
    {bounds: toLatLngBounds(boundsObject.bounds)},
  )
}

export default WithSearch
