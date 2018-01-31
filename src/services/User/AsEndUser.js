import { GUEST_USER_ID,
         SUPERUSER_GROUP_TYPE } from './User'
import _find from 'lodash/find'
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'

/**
 * Provides basic methods for interacting with users.
 */
export default class AsEndUser {
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
           !!_find(this.user.groups, {groupType: SUPERUSER_GROUP_TYPE})
  }
}
