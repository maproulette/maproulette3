import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with OSMElementData
 */
export default defineMessages({
  noOSMElements: {
    id: "OSMElementData.noOSMElements",
    defaultMessage: "No OSM elements identified in task",
  },

  elementFetchFailed: {
    id: "OSMElementData.elementFetchFailed",
    defaultMessage: "Failed to fetch tags for {element}",
  },

  viewOSMLabel: {
    id: "OSMElementData.controls.viewOSM.label",
    defaultMessage: "View OSM",
  },
})
