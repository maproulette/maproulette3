import _filter from "lodash/filter";
import _find from "lodash/find";
import _isNumber from "lodash/isNumber";
import _isObject from "lodash/isObject";
import { ROLE_SUPERUSER } from "../../services/Grant/Role";
import { GUEST_USER_ID } from "../../services/User/User";

/**
 * Provides basic methods for interacting with users.
 */
export class AsEndUser {
  constructor(user) {
    this.user = user;
  }

  /**
   * Returns true if the user is logged in, false otherwise.
   */
  isLoggedIn() {
    return _isObject(this.user) && _isNumber(this.user.id) && this.user.id !== GUEST_USER_ID;
  }

  /**
   * Returns true if the user is a super user, false otherwise.
   */
  isSuperUser() {
    return this.isLoggedIn() && !!_find(this.user.grants, { role: ROLE_SUPERUSER });
  }

  /**
   * Returns true if the user is a reviewer.
   */
  isReviewer() {
    return this.isLoggedIn() && this.user.settings.isReviewer;
  }

  /**
   * Returns true if the user's work needs to be reviewed.
   */
  needsReview() {
    return this.isLoggedIn() && this.user.settings.needsReview;
  }

  /**
   * Returns true if the user has at least one notification that is not marked
   * as read
   */
  hasUnreadNotifications() {
    return this.isLoggedIn() && !!_find(this.user.notifications, { isRead: false });
  }

  /**
   * Returns the number of notifications not marked as read
   */
  unreadNotificationCount() {
    if (!this.isLoggedIn()) {
      return 0;
    }

    return _filter(this.user.notifications, { isRead: false }).length;
  }
}

export default (user) => new AsEndUser(user);
