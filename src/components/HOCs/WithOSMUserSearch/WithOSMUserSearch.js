import React, { Component } from 'react'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import _startsWith from 'lodash/startsWith'
import _debounce from 'lodash/debounce'
import { findUser, findPreferredUsers } from '../../../services/User/User'

/**
 * WithOSMUserSearch provides a findUser function to the wrapped component that allows
 * it to initiate searches for MapRoulette users by OSM username or username fragment.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithOSMUserSearch = function(WrappedComponent) {
  return class extends Component {
    state = {
      isSearchingOSMUsers: false,
      osmUserResults: [],
    }

    /**
     * @private
     */
    performSearch = _debounce((username, taskId) => {
      this.setState({isSearchingOSMUsers: true})

      if (_isEmpty(username)) {
        findPreferredUsers(username, taskId).then(preferredResults => {
          this.setState({isSearchingOSMUsers: false,
                         osmUserResults: [],
                         osmUserPreferredResults: preferredResults})
        })
      }
      else {
        findUser(username).then(results => {
          if (taskId) {
            findPreferredUsers(username, taskId).then(preferredResults => {
              this.setState({isSearchingOSMUsers: false,
                             osmUserResults: results,
                             osmUserPreferredResults: preferredResults})
            })
          }
          else {
            this.setState({
              isSearchingOSMUsers: false,
              osmUserPreferredResults: [],
              osmUserResults: results
            })
          }
        })
      }
    }, 1000, {leading: true})

    /**
     * Initiates search for user with the given username or username fragment.
     */
    searchOSMUser = username => {
      // Start off by filtering our existing search results so that we don't continue
      // to show results that no longer match the new username.
      this.setState({
        isSearchingOSMUsers: true,
        osmUserResults: _filter(this.state.osmUserResults, result =>
          _startsWith(result.displayName.toLowerCase(), username.toLowerCase()))
      })

      this.performSearch(username, this.props.taskId)
    }

    osmUserKey = osmUser => osmUser.osmId

    osmUserLabel = osmUser => osmUser.displayName

    render() {
      return (
        <WrappedComponent isSearching={this.state.isSearchingOSMUsers}
                          searchResults={this.state.osmUserResults}
                          preferredResults={this.state.osmUserPreferredResults}
                          search={this.searchOSMUser}
                          resultKey={this.osmUserKey}
                          resultLabel={this.osmUserLabel}
                          {...this.props} />
      )
    }
  }
}

export default WithOSMUserSearch
