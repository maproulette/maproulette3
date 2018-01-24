import { SUPERUSER_GROUP_TYPE } from './User'
import { find as _find,
         get as _get,
         map as _map,
         filter as _filter } from 'lodash'
import AsEndUser from './AsEndUser'

/**
 * Provides methods specific to project and challenge management
 * with regard to the wrapped user.
 */
export default class AsManager extends AsEndUser {
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

    return !!_find(this.user.groups, userGroup =>
      userGroup.groupType === SUPERUSER_GROUP_TYPE ||
      _find(project.groups, {id: userGroup.id})
    )
  }

  manageableProjects(projects) {
    return _filter(projects, project => this.canManage(project))
  }

  manageableChallenges(projects, challenges) {
    const projectIds = _map(this.manageableProjects(projects), 'id')

    return _filter(challenges, challenge =>
      // handle both normalized and denormalized challenges
      projectIds.indexOf(_get(challenge, 'parent.id', challenge.parent)) !== -1
    )
  }
}
