import { Component } from 'react'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import _omit from 'lodash/omit'
import WithSearch from '../HOCs/WithSearch/WithSearch'
import queryString from 'query-string'

/**
 * WithMetricsSearchResults acts as a filter that applies the named search query to an
 * array of candidate items, presenting to the wrapped component only those
 * items that match the query.
 *
 * @param {string} searchName - the name of the search/query to work with
 * @param {string} itemsProp - the name of the prop containing the array
 *        of items to search (e.g. 'challenges' or 'projects' or 'users').
 * @param {string} outputProp - optional name of the prop to use when passing
 *        down the filtered results. By default it will be the same as
 *        itemsProp.
 **/

export const WithMetricsSearchResults = function (
  WrappedComponent,
  searchName,
  itemsProp,
  outputProp
) {
  return class extends Component {
    /**
     * @private
     */
    render() {
      const query = _get(this.props, `searchCriteria.query`, '')
      let items, searchType

      const params = queryString.parse(this.props.location.search)
      searchType = params['searchType'] || 'challenges'
      items = this.props[searchType]

      let searchResults = this.props[searchType]
      let searchActive = false

      if (searchType === 'challenges' && query) {
        searchResults = _filter(
          items,
          (item) => _get(item, 'name', '').toLowerCase().indexOf(query) !== -1
        )
      } else if (searchType === 'projects' && query) {
        searchResults = _filter(
          items,
          (item) =>
            _get(item, 'displayName', '').toLowerCase().indexOf(query) !== -1
        )
      } else if (searchType === 'users' && query) {
        searchResults = _filter(
          items,
          (item) =>
            _get(item, 'osmProfile.displayName', '')
              .toLowerCase()
              .indexOf(query) !== -1
        )
      }

      if (_isEmpty(outputProp)) {
        outputProp = itemsProp
      }
      outputProp = searchType
      searchName = searchType
      return (
        <WrappedComponent
          {...{
            [outputProp]: searchResults,
            [`${searchName}SearchActive`]: searchActive,
          }}
          {..._omit(this.props, outputProp)}
        />
      )
    }
  }
}

export default (
  WrappedComponent,
  searchName,
  itemsProp,
  outputProp,
  searchFunction = null
) =>
  WithSearch(
    WithMetricsSearchResults(
      WrappedComponent,
      searchName,
      itemsProp,
      outputProp
    ),
    searchName,
    searchFunction
  )
