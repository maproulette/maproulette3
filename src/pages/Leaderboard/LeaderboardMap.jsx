import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import { AttributionControl, MapContainer, Rectangle } from "react-leaflet";
import SourcedTileLayer from "../../components/EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import { boundingBoxForCountry } from "../../services/Leaderboard/CountryBoundingBoxes";
import { toLatLngBounds } from "../../services/MapBounds/MapBounds";
import { defaultLayerSource, layerSourceWithId } from "../../services/VisibleLayer/LayerSources";
import "./LeaderboardMap.scss";

export default class LeaderboardMap extends Component {
  mapLayerSource = () => {
    return layerSourceWithId("osm-mapnik-black_and_white") || defaultLayerSource();
  };

  render() {
    const boundingBox = boundingBoxForCountry(this.props.countryCode);

    return (
      <div className={classNames("leaderboard-map", this.props.className)}>
        <MapContainer
          bounds={toLatLngBounds(boundingBox)}
          maxBounds={toLatLngBounds(boundingBox)}
          zoomControl={false}
          worldCopyJump={true}
          dragging={false}
          scrollWheelZoom={false}
          attributionControl={false}
          minZoom={2}
          maxZoom={18}
        >
          <AttributionControl position="bottomleft" prefix={false} />
          <SourcedTileLayer source={this.mapLayerSource()} skipAttribution={true} />
          <Rectangle bounds={toLatLngBounds(boundingBox)} />
        </MapContainer>
      </div>
    );
  }
}

LeaderboardMap.propTypes = {
  /** Desired center-point of the map */
  countryCode: PropTypes.string.isRequired,
};
