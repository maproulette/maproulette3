import { GUEST_USER_ID } from '../../services/User/User'
import { GROUP_TYPE_SUPERUSER }
       from '../../services/Project/GroupType/GroupType'
import _find from 'lodash/find'
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'

/**
 * Provides basic methods for interacting with users.
 */
export class AsEndUser {
  constructor(user) {
    this.user = user
  }

  /**
   * Returns true if the user is logged in, false otherwise.
   */
  isLoggedIn() {
    return _isObject(this.user) &&
           _isNumber(this.user.id) && this.user.id !== GUEST_USER_ID
  }

  /**
   * Returns true if the user is a super user, false otherwise.
   */
  isSuperUser() {
    return this.isLoggedIn() &&
           !!_find(this.user.groups, {groupType: GROUP_TYPE_SUPERUSER})
  }

  /**
   * Returns true if the user is a reviewer.
   */
  isReviewer() {
    return this.isLoggedIn() && this.user.settings.isReviewer
  }

  /**
   * Returns true if the user's work needs to be reviewed.
   */
  needsReview() {
    return this.isLoggedIn() && this.user.settings.needsReview
  }
}

export default user => new AsEndUser(user)
