import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { fetchPlaceLocation } from '../../../services/Place/Place'
import WithErrors from '../WithErrors/WithErrors'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithNominatimSearch makes nominatim query management and search methods
 * available to the WrappedComponent
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithNominatimSearch = function(WrappedComponent) {
  class _WithNominatimSearch extends Component {
    state = {
      query: '',
      results: null,
      loading: false,
    }

    /**
     * Update the current Nominatim query
     */
    updateQuery = query => {
      this.setState({query, results: null})
    }

    /**
     * Execute Nominatim search with the current query
     */
    search = () => {
      this.setState({loading: true})
      fetchPlaceLocation(this.state.query).then(results => {
        this.setState({results, loading: false})
      }).catch(error => {
        this.setState({loading: false})
        this.props.addError(AppErrors.nominatim.fetchFailure)
      })
    }

    /**
     * Clear all search results and rests the query
     */
    clearSearch = () => {
      this.setState({query: '', results: null, loading: false})
    }

    /**
     * Selects a specific search result, which will invoke the onResultSelected
     * prop with the result and then reset the search
     */
    chooseResult = result => {
      this.props.onResultSelected(result.bbox)
      this.clearSearch()
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          nominatimQuery={this.state.query}
          updateNominatimQuery={this.updateQuery}
          searchNominatim={this.search}
          nominatimResults={this.state.results}
          clearNominatimSearch={this.clearSearch}
          chooseNominatimResult={this.chooseResult}
        />
      )
    }
  }

  _WithNominatimSearch.propTypes = {
    onResultSelected: PropTypes.func.isRequired,
  }

  return WithErrors(_WithNominatimSearch)
}

export default WithNominatimSearch
