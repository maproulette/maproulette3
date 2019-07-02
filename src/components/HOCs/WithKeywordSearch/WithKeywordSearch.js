import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import _reject from 'lodash/reject'
import _startsWith from 'lodash/startsWith'
import _debounce from 'lodash/debounce'
import { findKeyword } from '../../../services/Challenge/Challenge'

/**
 * WithKeywordSearch provides a search function to the wrapped component that allows
 * it to initiate searches for MapRoulette keywords by name prefix.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithKeywordSearch = function(WrappedComponent, includePrefixInResults=true) {
  return class extends Component {
    state = {
      isSearchingKeywords: false,
      keywordResults: [],
      existingKeywordCount: 0,
    }

    /**
     * @private
     */
    performSearch = _debounce(keywordPrefix => {
      this.setState({isSearchingKeywords: true})

      findKeyword(keywordPrefix, this.props.tagType || "challenges").then(results => {
        const existingKeywordCount = results.length
        const keywordResults = includePrefixInResults ?
                               this.resultsWithPrefix(keywordPrefix, results) :
                               results
        this.setState({
          isSearchingKeywords: false,
          keywordResults,
          existingKeywordCount,
        })
      })
    }, 1000, {leading: true})

    /**
     * Returns a new array containing the given keyword prefix prepended onto the
     * given results, and excluding any existing keyword prefixes previously
     * contained in the given results.
     *
     * @private
     */
    resultsWithPrefix = (prefix, results) => {
      const cleanResults = _reject(results, {id: null})
      cleanResults.unshift({id: null, name: prefix})
      return cleanResults
    }

    /**
     * Initiates search for keyword with the given name prefix.
     */
    searchKeyword = keywordPrefix => {
      if (_isEmpty(keywordPrefix)) {
        this.setState({keywordResults: [], existingKeywordCount: 0})
        return
      }

      // Start off by filtering our existing search results so that we don't continue
      // to show results that no longer match the new keywordPrefix.
      let keywordResults = _filter(this.state.keywordResults, result =>
        _startsWith(result.name.toLowerCase(), keywordPrefix.toLowerCase()))

      const existingKeywordCount = keywordResults.length
      if (includePrefixInResults) {
        keywordResults = this.resultsWithPrefix(keywordPrefix, keywordResults)
      }

      this.setState({isSearchingKeywords: true, keywordResults, existingKeywordCount})
      this.performSearch(keywordPrefix)
    }

    keywordKey = keyword => keyword.id

    keywordLabel = keyword => keyword.name

    render() {
      return (
        <WrappedComponent {...this.props}
                          isSearching={this.state.isSearchingKeywords}
                          searchResults={this.state.keywordResults}
                          existingKeywordCount={this.state.existingKeywordCount}
                          search={this.searchKeyword}
                          resultKey={this.keywordKey}
                          resultLabel={this.keywordLabel} />
      )
    }
  }
}


WithKeywordSearch.propTypes = {
  /** TagType to limit tags */
  tagType: PropTypes.string,
}


export default WithKeywordSearch
