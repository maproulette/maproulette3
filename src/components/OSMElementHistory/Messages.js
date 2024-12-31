import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with OSMElementHistory
 */
export default defineMessages({
  noOSMElements: {
    id: "OSMElementHistory.noOSMElements",
    defaultMessage: "No OSM elements identified in task",
  },

  elementFetchFailed: {
    id: "OSMElementHistory.elementFetchFailed",
    defaultMessage: "Failed to fetch history for {element}",
  },

  undeterminedVersion: {
    id: "OSMElementHistory.undeterminedVersion",
    defaultMessage: "Version detection unavailable for this task",
  },

  versionLabel: {
    id: "OSMElementHistory.version.label",
    defaultMessage: "Version {version, number}",
  },

  recentChangeTooltip: {
    id: "OSMElementHistory.recentChange.tooltip",
    defaultMessage: "Change made after MapRoulette task was created",
  },

  noComment: {
    id: "OSMElementHistory.noComment",
    defaultMessage: "(no changeset comment)",
  },

  viewOSMLabel: {
    id: "OSMElementHistory.controls.viewOSM.label",
    defaultMessage: "View OSM",
  },
});
