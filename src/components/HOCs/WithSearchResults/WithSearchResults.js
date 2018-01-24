import React, { Component } from 'react'
import Fuse from 'fuse.js'
import { get as _get,
         isString as _isString,
         isArray as _isArray,
         isEmpty as _isEmpty,
         filter as _filter,
         find as _find,
         startsWith as _startsWith,
         omit as _omit } from 'lodash'
import WithSearchQuery from '../WithSearchQuery/WithSearchQuery'
import { parseQueryString } from '../../../services/Search/Search'

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
const WithSearchResults = (WrappedComponent, searchName, itemsProp, outputProp) =>
  WithSearchQuery(
    _WithSearchResults(WrappedComponent, searchName, itemsProp, outputProp),
    searchName
  )

// Setup local fuzzy search configuration. See fusejs.io for details.
const searchOptions = {
  shouldSort: true, // sort results best to worst
  threshold: 0.4, // score: 0.0 is perfect, 1.0 terrible
  location: 0,
  distance: 100,
  maxPatternLength: 64, // max query length
  minMatchCharLength: 3,
  keys: ["name", "displayName", "blurb"], // fields to search
}

const _WithSearchResults = function(WrappedComponent, searchName, itemsProp, outputProp) {
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
      const query = _get(this.props, `searchQueries.${searchName}.searchQuery.query`, '')
      let items = this.props[itemsProp]
      let searchResults = this.props[itemsProp]

      if (_isString(query) && query.length > 0 &&
          _isArray(items) && items.length > 0) {
        const queryParts = parseQueryString(query)

        // If there are tags, filter the items up-front.
        if (queryParts.tagTokens.length > 0) {
          items = this.itemsMatchingTags(items, queryParts.tagTokens)
        }

        if (items.length > 0 && queryParts.query.length > 0) {
          const fuzzySearch = new Fuse(items, searchOptions)
          searchResults = fuzzySearch.search(queryParts.query)
        }
        else {
          searchResults = items
        }
      }

      if (_isEmpty(outputProp)) {
        outputProp = itemsProp
      }

      return <WrappedComponent {...{[outputProp]: searchResults}}
                               {..._omit(this.props, outputProp)} />
    }
  }
}

export default WithSearchResults
