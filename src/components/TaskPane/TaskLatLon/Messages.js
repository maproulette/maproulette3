import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with TaskLatLon
 */
export default defineMessages({
  latLonLabel: {
    id: "TaskLatLon.latLon.label",
    defaultMessage: "Lat/Lon:",
  },

  lonLatLabel: {
    id: "TaskLatLon.lonLat.label",
    defaultMessage: "Lon/Lat:",
  },

  latLonValue: {
    id: "TaskLatLon.latLon.value",
    defaultMessage: "{lat}, {lon}",
  },

  lonLatValue: {
    id: "TaskLatLon.lonLat.value",
    defaultMessage: "{lon}, {lat}",
  },
});
