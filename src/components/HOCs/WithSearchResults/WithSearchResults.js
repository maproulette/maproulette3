import React, { Component } from 'react'
import Fuse from 'fuse.js'
import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import _find from 'lodash/find'
import _startsWith from 'lodash/startsWith'
import _omit from 'lodash/omit'
import _map from 'lodash/map'
import WithSearch from '../WithSearch/WithSearch'
import { parseQueryString } from '../../../services/Search/Search'

// Local fuzzy search configuration. See fusejs.io for details.
const fuzzySearchOptions = {
  shouldSort: true, // sort results best to worst
  threshold: 0.4, // score: 0.0 is perfect, 1.0 terrible
  location: 0, // ideal location of query match in string (0 = beginning of string)
  distance: 500, // allowed distance from "location" (higher = less penalty for matches near end of string)
  maxPatternLength: 64, // max query length
  minMatchCharLength: 3,
  includeScore: true,
  keys: ["name", "displayName", "blurb"], // fields to search
}

/**
 * WithSearchResults acts as a filter that applies the named search query to an
 * array of candidate items, presenting to the wrapped component only those
 * items that (fuzzily) match the query.
 *
 * @param {string} searchName - the name of the search/query to work with
 * @param {string} itemsProp - the name of the prop containing the array
 *        of items to search (e.g. 'challenges' or 'projects').
 * @param {string} outputProp - optional name of the prop to use when passing
 *        down the filtered results. By default it will be the same as
 *        itemsProp.
 */
export const WithSearchResults = function(WrappedComponent, searchName,
                                          itemsProp, outputProp) {
  return class extends Component {
    /**
     * @private
     */
    itemsMatchingTags = (items, tagTokens) => {
      return _filter(items, (item) => {
        if (_isArray(item.tags)) {
          for (let tag of item.tags) {
            if (_find(tagTokens, (token) => _startsWith(tag, token))) {
              return true
            }
          }
        }

        return false
      })
    }

    render() {
      const query = _get(this.props, `searchCriteria.query`, '')
      let items = this.props[itemsProp]
      let searchResults = this.props[itemsProp]
      let searchActive = false

      if (_isString(query) && query.length > 0 &&
          _isArray(items) && items.length > 0) {
        const queryParts = parseQueryString(query)

        // If there are tags, filter the items up-front.
        if (queryParts.tagTokens.length > 0) {
          items = this.itemsMatchingTags(items, queryParts.tagTokens)
        }

        if (items.length > 0 && queryParts.query.length > 0) {
          const fuzzySearch = new Fuse(items, fuzzySearchOptions)
          searchResults = _map(fuzzySearch.search(queryParts.query),
                            (result) => {
                              result.item.score = result.score
                              return result.item
                            })
          searchActive = true
        }
        else {
          searchResults = items
        }
      }

      if (_isEmpty(outputProp)) {
        outputProp = itemsProp
      }

      return <WrappedComponent {...{
                                 [outputProp]: searchResults,
                                 [`${searchName}SearchActive`]: searchActive,
                               }}
                               {..._omit(this.props, outputProp)} />
    }
  }
}

export default (WrappedComponent, searchName, itemsProp, outputProp, searchFunction = null) =>
  WithSearch(
    WithSearchResults(WrappedComponent, searchName, itemsProp, outputProp),
    searchName,
    searchFunction
  )
