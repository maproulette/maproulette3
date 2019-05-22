import React, { Component } from 'react'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _findIndex from 'lodash/findIndex'
import WithManageableProjects from '../WithManageableProjects/WithManageableProjects'
import WithChallenges from '../../../HOCs/WithChallenges/WithChallenges'
import AsManager from '../../../../interactions/User/AsManager'

/**
 * WithPermittedChallenges filters challenges so that only permitted challenges
 * are passed down. A permitted challenge is one that is enabled, in an enabled
 * project or is part of a managed project (or if you are a super user).
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithPermittedChallenges = function(WrappedComponent) {
  return class extends Component {
    render() {
      // By default, only pass through challenges that are enabled (and belong to
      // an enabled project), or belong to projects the user manages.
      const usableChallenges = _filter(this.props.challenges, challenge => {
        return AsManager(this.props.user).isSuperUser() ||
              (challenge.enabled && _get(challenge, 'parent.enabled')) ||
               _findIndex(this.props.projects,
                 (p) => p.id === _get(challenge, 'parent.id')) !== -1
      })

      return <WrappedComponent {...this.props} challenges={usableChallenges} />
    }
  }
}

export default (WrappedComponent) =>
  WithManageableProjects(WithChallenges(WithPermittedChallenges(WrappedComponent)))
