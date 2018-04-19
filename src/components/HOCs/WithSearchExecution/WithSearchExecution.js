import React, { Component } from 'react'
import { connect } from 'react-redux'
import _debounce from 'lodash/debounce'
import _omit from 'lodash/omit'
import _isFunction from 'lodash/isFunction'
import WithSearchQuery from '../../HOCs/WithSearchQuery/WithSearchQuery'
import { performSearch } from '../../../services/Search/Search'

/**
 * WithSearchExecution provides a means of coupling search UI components with the
 * Search service using a custom search function. Wrapped components receive a
 * fetchResults function that is used to execute searches via the Search service
 * using the given searchFunction.
 *
 * @param {string} searchName - the name of the search/query to work with.
 * @param {function} searchFunction - the custom search function to be executed
 *        by the Search service for retrieving results.
 *
 * > Note: WithSearchExecution also wraps the given component in the
 * > WithSearchQuery HOC, providing it with facilities for managing the
 * > current query text for the named search. It does not, however, provide
 * > search results: use the WithSearchResults HOC if results are needed.
 *
 * @see See WithSearchQuery
 * @see See WithSearchResults
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithSearchExecution = (WrappedComponent, searchName, searchFunction) =>
  connect(null, mapDispatchToProps)(
    WithSearchQuery(
      _WithSearchExecution(WrappedComponent, searchName, searchFunction),
      searchName
    )
  )

export const _WithSearchExecution = function(WrappedComponent, searchName, searchFunction) {
  return class extends Component {
    fetchResults = _debounce(query => {
      // If multiple WithSearchExecution HOCs are chained, pass it up
      if (_isFunction(this.props.fetchResults)) {
        this.props.fetchResults(query)
      }

      this.props.performSearch(searchName, query, searchFunction)
    }, 1000)

    render() {
      const queryProps = this.props.searchQueries[searchName]
      return <WrappedComponent fetchResults={this.fetchResults}
                               {...queryProps}
                               {..._omit(this.props, ['performSearch', 'fetchResults'])} />
    }
  }
}

export const mapDispatchToProps = dispatch => ({
  performSearch: (searchName, query, searchFunction) =>
    dispatch(performSearch(searchName, query, searchFunction)),
})

export default WithSearchExecution
