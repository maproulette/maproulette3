import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with OSMElementTags
 */
export default defineMessages({
  noOSMElements: {
    id: "OSMElementHistory.noOSMElements",
    defaultMessage: "No OSM elements identified in task",
  },

  elementFetchFailed: {
    id: "OSMElementTags.elementFetchFailed",
    defaultMessage: "Failed to fetch tags for {element}",
  },

  viewOSMLabel: {
    id: "OSMElementHistory.controls.viewOSM.label",
    defaultMessage: "View OSM",
  },
});
