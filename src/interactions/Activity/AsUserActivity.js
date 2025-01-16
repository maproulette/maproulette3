import _isFinite from "lodash/isFinite";
import { ActivityItemType } from "../../services/Activity/ActivityItemTypes/ActivityItemTypes";
/**
 * AsUserActivity adds functionality to user activity related to inspection of
 * that activity
 *
 * @author
 */
export class AsUserActivity {
  constructor(activity) {
    this.activity = activity;
  }

  /**
   * Retrieve id of a challenge on which a task was recently completed
   */
  recentChallengeId() {
    if (this.activity) {
      let entry = null;
      for (let i = 0; i < this.activity.length; i++) {
        entry = this.activity[i];
        if (entry.typeId === ActivityItemType.task && _isFinite(entry.parentId)) {
          return entry.parentId;
        }
      }
    }

    return null;
  }
}

export default (task) => new AsUserActivity(task);
