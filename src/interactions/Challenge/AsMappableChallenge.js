import { basemapLayerSource } from "../../services/VisibleLayer/LayerSources";

/**
 * AsMappableChallenge adds functionality to a Challenge related to mapping.
 */
export class AsMappableChallenge {
  constructor(challenge) {
    Object.assign(this, challenge);
  }

  defaultLayerSource() {
    if (!Number.isFinite(this.id)) {
      return null;
    }

    return basemapLayerSource(this.defaultBasemap, this.defaultBasemapId, this.customBasemap);
  }
}

export default (challenge) => new AsMappableChallenge(challenge);
