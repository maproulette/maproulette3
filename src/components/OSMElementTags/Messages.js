import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with OSMElementTags
 */
export default defineMessages({
  noOSMElements: {
    id: "OSMElementTags.noOSMElements",
    defaultMessage: "No OSM elements identified in task",
  },

  elementFetchFailed: {
    id: "OSMElementTags.elementFetchFailed",
    defaultMessage: "Failed to fetch tags for {element}",
  },

  viewOSMLabel: {
    id: "OSMElementTags.controls.viewOSM.label",
    defaultMessage: "View OSM",
  },
});
