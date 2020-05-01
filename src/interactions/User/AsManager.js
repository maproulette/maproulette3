import { Role, rolesImply, ROLE_SUPERUSER }
       from '../../services/Grant/Role'
import { TargetType } from '../../services/Grant/TargetType'
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
   * Returns the user's roles for the given project
   */
  projectRoles(project) {
    if (!this.user || !project) {
      return []
    }

    return _map(
      _filter(this.user.grants, grant =>
        grant.role === ROLE_SUPERUSER ||
        (grant.target.objectType === TargetType.project && grant.target.objectId === project.id)
      ),
      'role'
    )
  }

  /**
   * Determines if the user's roles satisfy (meet or exceed) the given
   * role for the given project. Returns true if either:
   * - The user is a superuser
   * - The user possesses a role for the project that implies the given role
   */
  satisfiesProjectRole(project, role) {
    if (!this.isLoggedIn()) {
      return false
    }

    return rolesImply(role, this.projectRoles(project))
  }

  /**
   * Determines if the user has permission to read the given project. A user
   * is considered to have read access if any of the following are true:
   * - They are a superuser
   * - They are the project owner
   * - They possess any of the project's roles (read, write, or admin).
   *
   * @returns true if the user has read access, false otherwise.
   */
  canReadProject(project) {
    return this.satisfiesProjectRole(project, Role.read)
  }

  /**
   * Determines if the user has permission to write to the given project. A user
   * is considered to have write access if any of the following are true:
   * - They are a superuser
   * - They are the project owner
   * - They possess the project's write role
   * - They possess the project's admin role
   *
   * @returns true if the user has read access, false otherwise.
   */
  canWriteProject(project) {
    return this.satisfiesProjectRole(project, Role.write)
  }

  /**
   * Determines if the user is a project manager of the given project. Any user
   * with at least read access to the project is considered a manager.
   *
   * @returns true if the user can manage the project, false otherwise.
   */
  canManage(project) {
    return this.satisfiesProjectRole(project, Role.read)
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
    return this.satisfiesProjectRole(project, Role.admin)
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
