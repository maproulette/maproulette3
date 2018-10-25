import React, { Component } from 'react'

/**
 * WithPinned provides the WrappedComponent with projects and challenges that
 * the managing user has "pinned" in the admin area to easily keep them in
 * view, as well as functions for managing pinned entities.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithPinned = function(WrappedComponent) {
  return class extends Component {
    /**
     * Retrieves all pinned entities from the user's app settings
     *
     * @private
     */
    allPinnedEntities = () => {
      return this.props.getUserAppSetting(this.props.user, 'pinned') || {}
    }

    /**
     * Retrieves pinned entities of the given entity type (projects, challenges, etc)
     *
     * @private
     */
    pinned = entityType => this.allPinnedEntities()[entityType] || []

    /**
     * Updates the pins for an entity type.
     *
     * @private
     */
    updatePins = (entityType, newPins) => {
      this.props.updateUserAppSetting(this.props.user.id, {
        'pinned': Object.assign({}, this.allPinnedEntities(), {
          [entityType]: newPins,
        })
      })
    }

    /**
     * Toggles the pinned status of the given entity
     *
     * @private
     */
    togglePin = (entityType, entityId) => {
      const newPins = new Set(this.pinned(entityType))
      newPins.has(entityId) ? newPins.delete(entityId) : newPins.add(entityId)
      this.updatePins(entityType, [...newPins])
    }

    render() {
      // Don't render if we're still fetching user data
      if (this.props.checkingLoginStatus || !this.props.user.isLoggedIn) {
        return null
      }

      return <WrappedComponent
              {...this.props}
              pinnedProjects={this.pinned('projects')}
              pinnedChallenges={this.pinned('challenges')}
              toggleProjectPin={projectId => this.togglePin('projects', projectId)}
              toggleChallengePin={challengeId => this.togglePin('challenges', challengeId)} />
    }
  }
}

export default WrappedComponent => WithPinned(WrappedComponent)
