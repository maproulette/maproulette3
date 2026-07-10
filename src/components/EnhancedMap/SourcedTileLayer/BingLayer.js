import { createLayerComponent } from "@react-leaflet/core";
import L from "leaflet";

// Side-effect import: registers L.BingLayer / L.bingLayer on the Leaflet global.
// We intentionally bypass react-leaflet-bing-v2's own Bing.js wrapper, which does
// `import {bingLayer} from './leaflet.bing'` — a binding that file never exports.
// Older bundlers ignored the dead import; Vite/rolldown rejects it as MISSING_EXPORT.
import "react-leaflet-bing-v2/src/leaflet.bing.js";

const createLeafletElement = (props) => {
  const instance = L.bingLayer(props.bingkey, props);
  return { instance };
};

export const BingLayer = createLayerComponent(createLeafletElement);
