import React, { Component } from 'react'

/**
 * WithTallied provides the WrappedComponent with challenges that
 * the managing user has marked as to be "tallied" in the admin area
 * so they can be included when calculating metrics.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithTallied = function(WrappedComponent) {
  return class extends Component {
    state = {
      searchActive: false,
      searchTallies: {}
    }

    /**
     * Retrieves all tallied challenges from the user's app settings
     *
     * @private
     */
    allTalliedEntities = () => {
      if (this.state.searchActive) {
          return this.state.searchTallies
      }
      return this.props.getUserAppSetting(this.props.user, 'tallied') || {}
    }

    /**
     * Retrieves tallied challenges from the given parent
     *
     * @private
     */
    tallied = (parentId) => {
      return this.allTalliedEntities()[parentId]
    }

    /**
     * Updates the tallyMarks for a parentId.
     *
     * @private
     */
    updateTallyMarks = (parentId, newTallyMarks) => {
      const newTallyStore =
        Object.assign({}, this.allTalliedEntities(), {
          [parentId]: newTallyMarks,
        })

      if (this.state.searchActive) {
        this.setState({searchTallies: newTallyStore})
      } else {
        this.props.updateUserAppSetting(this.props.user.id, {
          'tallied': newTallyStore
        })
      }
    }

    /**
     * clears the tallyMarks for a parentId.
     *
     * @private
     */
    clearTallies = (parentId) => {
      this.updateTallyMarks(parentId, [])
    }

    /**
     * Toggles the tallied status of the given challenge
     *
     * @private
     */
    toggleTallyMark = (parentId, challengeId) => {
      const newTallyMarks = new Set(this.tallied(parentId))
      newTallyMarks.has(challengeId) ? newTallyMarks.delete(challengeId) :
                                    newTallyMarks.add(challengeId)
      this.updateTallyMarks(parentId, [...newTallyMarks])
    }

    /**
     * Resets all tallyMarks for a project.
     *
     * @private
     */
    resetTallyMarks = (parentId) => {
      if (this.state.searchActive) {
        this.setState({searchTallies: {}})
      }
      else {
        this.updateTallyMarks(parentId, [])
      }
    }

    /**
     * Toggles whether we are in searh mode. When in search
     * mode we do not want to update the user's app settings.
     *
     * @private
     */
    toggleSearchTallies = (parentId, updateChallenges = null) => {
      const newSearchActive = !this.state.searchActive
      if (updateChallenges) {
        const newTallyStore =
            Object.assign({}, this.allTalliedEntities(), {
              [parentId]: updateChallenges,
            })

        if (newSearchActive) {
          this.setState({searchActive: newSearchActive, searchTallies: newTallyStore})
        }
        else {
          this.props.updateUserAppSetting(this.props.user.id, {
            'tallied': newTallyStore
          })
          this.setState({searchActive: newSearchActive})
        }
      }
      else {
        this.setState({searchActive: newSearchActive})
      }
    }

    /**
     * Returns whether this challenge is marked as tallied.
     *
     * @private
     */
    showAsTallied = (parentId, challengeId) => {
      return (this.tallied(parentId) || []).indexOf(challengeId) !== -1
    }

    render() {
      // Don't render if we're still fetching user data
      if (this.props.checkingLoginStatus || !this.props.user.isLoggedIn) {
        return null
      }

      return <WrappedComponent
              {...this.props}
              talliedChallenges={this.tallied}
              toggleChallengeTally={this.toggleTallyMark}
              updateTallyMarks={this.updateTallyMarks}
              showAsTallied={this.showAsTallied}
              toggleSearchTallies={this.toggleSearchTallies}
              clearTallies={this.clearTallies} />
    }
  }
}

export default WrappedComponent => WithTallied(WrappedComponent)
