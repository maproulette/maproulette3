import _isFinite from "lodash/isFinite";
import _uniqueId from "lodash/uniqueId";

import { ActivityActionType } from "../../services/Activity/ActivityActionTypes/ActivityActionTypes";
import { ActivityItemType } from "../../services/Activity/ActivityItemTypes/ActivityItemTypes";

/**
 * AsTaskActivityMessage adds functionality to make a websocket message about task
 * activity compatible with activity components
 */
export class AsTaskActivityMessage {
  constructor(message) {
    Object.assign(this, message);
  }

  /**
   * Generate representation of message compatible with activity items, or null
   * if that's not possible for this particular message
   */
  asActivityItem() {
    const itemAction = this.activityAction();
    if (!_isFinite(itemAction)) {
      return null;
    }

    return {
      id: parseInt(_uniqueId("-")), // use negative ids
      action: itemAction,
      typeId: ActivityItemType.task,
      created: this.meta.created,
      itemId: this.data.task.id,
      parentId: this.data.challenge.id,
      parentName: this.data.challenge.name,
      status: this.data.task.status,
      task: this.data.task,
      user: this.activityUser(),
    };
  }

  /**
   * Map message type to activity action when possible
   */
  activityAction() {
    switch (this.messageType) {
      case "task-claimed":
        return ActivityActionType.taskViewed;
      case "task-completed":
        return ActivityActionType.taskStatusSet;
      default:
        return null;
    }
  }

  /**
   * Represent message user data as format used by activity items
   */
  activityUser() {
    return {
      id: this.data.byUser.userId,
      osmProfile: {
        id: this.data.byUser.osmId,
        displayName: this.data.byUser.displayName,
        avatarURL: this.data.byUser.avatarURL,
      },
    };
  }
}

export default (message) => new AsTaskActivityMessage(message);
