import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with EnhancedMap
 */
export default defineMessages({
  layerSelectionHeader: {
    id: "Map.layerSelectionList.header",
    defaultMessage: "Select Desired Feature",
  },
  osmDataAreaTooLarge: {
    id: "Task.osmData.areaTooLarge",
    defaultMessage:
      "The selected area is too large to load OSM data. Please zoom in further to view OSM features.",
  },
  osmDataTooLarge: {
    id: "Task.map.osmData.tooLarge",
    defaultMessage: "OSM Data Area Too Large",
  },
  zoomInForOSMData: {
    id: "Task.map.osmData.zoomInRequired",
    defaultMessage: "Please zoom in closer to view OSM data for this area",
  },
  osmDataError: {
    id: "Task.map.osmData.error",
    defaultMessage: "Error Loading OSM Data",
  },
});
