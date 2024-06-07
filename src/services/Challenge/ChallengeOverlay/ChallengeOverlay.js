import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from '../../../../src/components/EnhancedMap/LayerToggle/Messages';

export const layerLabels = [
  { id: "task-features", name: <FormattedMessage {...messages.showTaskFeaturesLabel} /> },
  { id: "osm-data", name: <FormattedMessage {...messages.showOSMDataLabel} /> },
  { id: "mapillary", name: <FormattedMessage {...messages.showMapillaryLabel} /> },
  { id: "openstreetcam", name: <FormattedMessage {...messages.showOpenStreetCamLabel} /> },
];