import { ActivityItemType } from "../Activity/ActivityItemTypes/ActivityItemTypes";

// Target types use the item type constants on the server
export const TARGET_TYPE_PROJECT = ActivityItemType.project;
export const TARGET_TYPE_GROUP = ActivityItemType.group;

export const TargetType = Object.freeze({
  project: TARGET_TYPE_PROJECT,
  group: TARGET_TYPE_GROUP,
});
