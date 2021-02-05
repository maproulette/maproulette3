import { Role, rolesImply, ROLE_SUPERUSER }
       from '../../services/Grant/Role'
import { TargetType } from '../../services/Grant/TargetType'
import { GranteeType } from '../../services/Grant/GranteeType'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'
import _isFinite from 'lodash/isFinite'
import _each from 'lodash/each'
import _uniq from 'lodash/uniq'
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
   * Returns the roles granted to the user user on the given project
   */
  projectRoles(project) {
    if (!this.user || !project) {
      return []
    }

    // Combine the grants on the user with those on the project. This is
    // potentially more lenient, but helps prevent erroneous security errors in
    // the event of stale data (and the server will stop anything if the user
    // actually lacks permission)
    const userGrants = _filter(this.user.grants, grant =>
      grant.role === ROLE_SUPERUSER || (
        grant.target &&
        grant.target.objectType === TargetType.project &&
        grant.target.objectId === project.id
      )
    )

    const projectGrants = _filter(project.grants, grant =>
      grant.grantee &&
      grant.grantee.granteeType === GranteeType.user &&
      grant.grantee.granteeId === this.user.id
    )

    return _uniq(_map(userGrants.concat(projectGrants), 'role'))
  }

  /**
   * Determines if the user's roles satisfy (meet or exceed) the given role for
   * the given project
   */
  satisfiesProjectRole(project, role) {
    if (!this.isLoggedIn()) {
      return false
    }

    return rolesImply(role, this.projectRoles(project))
  }

  /**
   * Determines if the user has been granted a read role or higher on a project
   *
   * @returns true if the user has read access, false otherwise.
   */
  canReadProject(project) {
    return this.satisfiesProjectRole(project, Role.read)
  }

  /**
   * Determines if the user has been granted a write role or higher on a
   * project
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
   * Determines if the given user has been granted an admin role on the project
   * (or is a superuser)
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

  /**
   * Returns the user's granted roles on a group
   */
  groupRoles(group) {
    if (!this.user || !group) {
      return []
    }

    return _map(
      _filter(this.user.grants, grant =>
        grant.role === ROLE_SUPERUSER ||
        (grant.target.objectType === TargetType.group && grant.target.objectId === group.id)
      ),
      'role'
    )
  }

  /**
   * Determines if the user's roles satisfy (meet or exceed) the given
   * role for the given group
   */
  satisfiesGroupRole(group, role) {
    if (!this.isLoggedIn()) {
      return false
    }

    return rolesImply(role, this.groupRoles(group))
  }

  /**
   * Determines if the given has an admin role on the group (or is a superuser)
   *
   * @returns true if the user can administrate the group, false otherwise.
   */
  canAdministrateGroup(group) {
    return this.satisfiesGroupRole(group, Role.admin)
  }

  /**
   * Alias for canAdministrateGroup, as teams are groups
   */
  canAdministrateTeam(team) {
    return this.canAdministrateGroup(team)
  }
}

export default user => new AsManager(user)
