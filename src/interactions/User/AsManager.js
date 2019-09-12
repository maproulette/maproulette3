import { GroupType,
         groupTypesImply,
         GROUP_TYPE_SUPERUSER }
       from '../../services/Project/GroupType/GroupType'
import _some from 'lodash/some'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'
import _isFinite from 'lodash/isFinite'
import _each from 'lodash/each'
import { AsEndUser } from './AsEndUser'

/**
 * Provides methods specific to project and challenge management
 * with regard to the wrapped user.
 */
export class AsManager extends AsEndUser {
  /**
   * Determines if the user is the owner of the given project.
   *
   * @return true if the user is the owner, false if not or if the project is
   *              undefined.
   */
  isProjectOwner(project) {
    if (!project) {
      return false
    }

    const osmId = _get(this.user, 'osmProfile.id')
    return (_isFinite(osmId) && osmId === project.owner)
  }

  /**
   * Returns the user's group types (roles) for the given project.
   */
  projectGroupTypes(project) {
    if (!this.user || !project) {
      return []
    }

    return _map(
      _filter(this.user.groups, userGroup =>
        userGroup.groupType === GROUP_TYPE_SUPERUSER ||
        _some(project.groups, {id: userGroup.id})
      ),
      'groupType'
    )
  }

  /**
   * Determines if the user's group types satisfy (meet or exceed) the given
   * group type for the given project. Returns true if any of the following are
   * true:
   * - The user is a superuser
   * - The user is the project owner
   * - The user possesses a group type for the project that implies the given group type.
   */
  satisfiesProjectGroupType(project, groupType) {
    if (!this.isLoggedIn()) {
      return false
    }

    if (this.isProjectOwner(project)) {
      return true
    }

    return groupTypesImply(groupType, this.projectGroupTypes(project))
  }

  /**
   * Determines if the user has permission to read the given project. A user
   * is considered to have read access if any of the following are true:
   * - They are a superuser
   * - They are the project owner
   * - They possess any of the project's group types (read, write, or admin).
   *
   * @returns true if the user has read access, false otherwise.
   */
  canReadProject(project) {
    return this.satisfiesProjectGroupType(project, GroupType.read)
  }

  /**
   * Determines if the user has permission to write to the given project. A user
   * is considered to have write access if any of the following are true:
   * - They are a superuser
   * - They are the project owner
   * - They possess the project's write group type
   * - They possess the project's admin group type
   *
   * @returns true if the user has read access, false otherwise.
   */
  canWriteProject(project) {
    return this.satisfiesProjectGroupType(project, GroupType.write)
  }

  /**
   * Determines if the user is a project manager of the given project. Any user
   * with at least read access to the project is considered a manager.
   *
   * @returns true if the user can manage the project, false otherwise.
   */
  canManage(project) {
    return this.satisfiesProjectGroupType(project, GroupType.read)
  }

  /**
   * Determines if the given user can administrate the given project, which
   * represents higher authority than simply managing it. A user is considered
   * a project administrator if any of the following are true:
   * - They are a superuser
   * - They are the project owner
   * - They possess the project's admin group
   *
   * @returns true if the user can administrate the project, false otherwise.
   */
  canAdministrateProject(project) {
    return this.satisfiesProjectGroupType(project, GroupType.admin)
  }

  /**
   * Determines if the given user has permission to manage the given challenge.
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

    const projectChallenges = new Set()

    _each(challenges, challenge => {
      // handle both normalized and denormalized challenges
      if (projectIds.indexOf(_get(challenge, 'parent.id', challenge.parent)) !== -1) {
        projectChallenges.add(challenge)
      }

      _each(challenge.virtualParents, (vp) => {
        if (projectIds.indexOf(_isObject(vp) ? vp.id : vp) !== -1) {
          if (!projectChallenges.has(challenge)) {
            projectChallenges.add(challenge)
          }
        }
      })
    })
    return [...projectChallenges]
  }
}

export default user => new AsManager(user)
