import { GUEST_USER_ID } from '../../services/User/User'
import { GROUP_TYPE_SUPERUSER }
       from '../../services/Project/GroupType/GroupType'
import _find from 'lodash/find'
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'
import _get from 'lodash/get'

const USER_COLORS = ["mr-text-indigo-300", "mr-text-indigo-500", "mr-text-indigo-700",
                     "mr-text-ocean-300", "mr-text-ocean-500", "mr-text-ocean-700",
                     "mr-text-forest-300", "mr-text-forest-500", "mr-text-forest-700",
                     "mr-text-cranberry-300", "mr-text-cranberry-500", "mr-text-cranberry-700",
                     "mr-text-aqua-300", "mr-text-aqua-500", "mr-text-aqua-700",
                     "mr-text-tangerine-300", "mr-text-tangerine-500",
                     "mr-text-banana-500", "mr-text-banana-700",
                     "mr-text-mint-300", "mr-text-mint-500",
                     "mr-text-cotton-candy-500", "mr-text-cotton-candy-700"]

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

  /**
   * Returns true if the user has at least one notification that is not marked
   * as read
   */
  hasUnreadNotifications() {
    return this.isLoggedIn() &&
           !!_find(this.user.notifications, {isRead: false})
  }

  /**
   * Returns a mr-text-* color for the user's displayName
   */
  colorCode() {
    return mapColors(_get(this.user, 'osmProfile.displayName'))
  }
}

/**
 * Returns a mr-text-* color based off a hash of the username.
 */
export function mapColors(username) {
  if (!username) return ""

  return USER_COLORS[Math.abs(hashCode(username)) % USER_COLORS.length]
}

export function hashCode(s) {
  let h = 0
  for(let i = 0; i < s.length; i++)
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  return h
}

export default user => new AsEndUser(user)
