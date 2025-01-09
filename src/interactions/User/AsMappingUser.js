import _clone from "lodash/clone";
import _find from "lodash/find";
import _isEmpty from "lodash/isEmpty";
import _isObject from "lodash/isObject";
import _map from "lodash/map";
import { LayerSources, basemapLayerSource } from "../../services/VisibleLayer/LayerSources";

/**
 * AsMappingUser adds functionality to a user related to mapping.
 */
export class AsMappingUser {
  constructor(user) {
    Object.assign(this, user);
  }

  allLayerSources() {
    const customBasemaps = this.settings
      ? _map(this.settings.customBasemaps, (basemap) => basemapLayerSource(basemap, basemap.name))
      : [];

    return _clone(LayerSources).concat(customBasemaps);
  }

  defaultLayerSource() {
    if (!Number.isFinite(this.id) || !_isObject(this.settings)) {
      return null;
    }

    // Try to find a custom basemap if the user has one selected.
    if (!_isEmpty(this.settings.defaultBasemapId)) {
      return this.findLayerSource(this.settings.defaultBasemapId);
    }

    return basemapLayerSource(this.settings.defaultBasemap, this.settings.defaultBasemapId);
  }

  findLayerSource(layerId) {
    return _find(this.allLayerSources(), (source) => source.id === layerId);
  }
}

export default (user) => new AsMappingUser(user);
