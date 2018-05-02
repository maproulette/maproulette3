import { SUPERUSER_GROUP_TYPE } from '../../services/User/User'
import _some from 'lodash/some'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'
import _isFinite from 'lodash/isFinite'
import { AsEndUser } from './AsEndUser'

/**
 * Provides methods specific to project and challenge management
 * with regard to the wrapped user.
 */
export class AsManager extends AsEndUser {
  /**
   * Determines if the given user has permissions to manage the given
   * project.
   *
   * @returns true if the user can manage the project, false otherwise.
   */
  canManage(project) {
    if (!this.isLoggedIn()) {
      return false
    }

    const osmId = _get(this.user, 'osmProfile.id')
    return (_isFinite(osmId) && osmId === project.owner) ||
           _some(this.user.groups,
                 userGroup => userGroup.groupType === SUPERUSER_GROUP_TYPE ||
                              _some(project.groups, {id: userGroup.id}))
  }

  /**
   * Determines if the given user has permissions to manage the given
   * challenge.
   *
   * > Note that if challenge is not denormalized with a parent object field,
   * > this method will return false.
   */
  canManageChallenge(challenge) {
    if (!_isObject(challenge.parent)) {
      return false
    }

    return this.canManage(challenge.parent)
  }

  /**
   * Filters the given array of projects and returns those the user has
   * permission to manage.
   */
  manageableProjects(projects) {
    return _filter(projects, project => this.canManage(project))
  }

  /**
   * Filters the given list of challenges and returns those that the user
   * has permission to manage.
   */
  manageableChallenges(projects, challenges) {
    const projectIds = _map(this.manageableProjects(projects), 'id')

    return _filter(challenges, challenge =>
      // handle both normalized and denormalized challenges
      projectIds.indexOf(_get(challenge, 'parent.id', challenge.parent)) !== -1
    )
  }
}

export default user => new AsManager(user)
