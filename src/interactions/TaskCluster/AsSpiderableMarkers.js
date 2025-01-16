import { Point } from "leaflet";
import _cloneDeep from "lodash/cloneDeep";
import _each from "lodash/each";

const MAX_CIRCLE_MARKERS = 8;
const CIRCLE_START_ANGLE = (Math.PI * 2) / 12;
const SPIRAL_LENGTH_START = 11;
const SPIRAL_FOOT_SEPARATION = 28;
const SPIRAL_LENGTH_FACTOR = 5;

export class AsSpiderableMarkers {
  constructor(markers) {
    this.markers = markers;
  }

  spider(centerPointPx, iconSizePx) {
    if (!this.markers || this.markers.length === 0) {
      return;
    }

    // Default to spidering in a circle, but use spiral if there are too many markers
    const spiderMethod =
      this.markers.length > MAX_CIRCLE_MARKERS ? this.spiderSpiral : this.spiderCircle;
    return spiderMethod(centerPointPx, iconSizePx, this.markers);
  }

  // Based on https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
  spiderCircle(centerPointPx, iconSizePx, affectedMarkers) {
    const spideredMarkers = new Map();
    const circumferencePx = (iconSizePx / 2) * (2 + affectedMarkers.length);
    const legLengthPx = circumferencePx / (Math.PI * 2); // radius from circumference
    const angleStep = (Math.PI * 2) / affectedMarkers.length;

    _each(affectedMarkers, (marker, index) => {
      const relocatedMarker = _cloneDeep(marker);
      const angle = CIRCLE_START_ANGLE + index * angleStep;
      relocatedMarker.originalPosition = relocatedMarker.position;
      relocatedMarker.positionPx = new Point(
        centerPointPx.x + legLengthPx * Math.cos(angle),
        centerPointPx.y + legLengthPx * Math.sin(angle),
      );
      spideredMarkers.set(relocatedMarker.options.taskId, relocatedMarker);
    });

    return spideredMarkers;
  }

  // Based on https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
  spiderSpiral(centerPointPx, iconSizePx, affectedMarkers) {
    const spideredMarkers = new Map();
    let legLengthPx = SPIRAL_LENGTH_START;
    let angle = 0;

    _each(affectedMarkers, (marker, index) => {
      const relocatedMarker = _cloneDeep(marker);
      angle += SPIRAL_FOOT_SEPARATION / legLengthPx + index * 0.0005;
      relocatedMarker.originalPosition = relocatedMarker.position;
      relocatedMarker.positionPx = new Point(
        centerPointPx.x + legLengthPx * Math.cos(angle),
        centerPointPx.y + legLengthPx * Math.sin(angle),
      );
      legLengthPx += Math.PI * 2 * (SPIRAL_LENGTH_FACTOR / angle);
      spideredMarkers.set(relocatedMarker.options.taskId, relocatedMarker);
    });

    return spideredMarkers;
  }
}

export default (markers) => new AsSpiderableMarkers(markers);
