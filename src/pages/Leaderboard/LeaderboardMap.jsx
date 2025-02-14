import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import { Rectangle } from "react-leaflet";
import SourcedTileLayer from "../../components/EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithMapContainer from "../../components/HOCs/WithMapContainer/WithMapContainer";
import { boundingBoxForCountry } from "../../services/Leaderboard/CountryBoundingBoxes";
import { toLatLngBounds } from "../../services/MapBounds/MapBounds";
import {
  defaultLayerSource,
  layerSourceWithId,
} from "../../services/VisibleLayer/LayerSources";
import "./LeaderboardMap.scss";

class LeaderboardMap extends Component {
  mapLayerSource = () => {
    return (
      layerSourceWithId("osm-mapnik-black_and_white") || defaultLayerSource()
    );
  };

  render() {
    const boundingBox = boundingBoxForCountry(this.props.countryCode);
    const bounds = toLatLngBounds(boundingBox);

    return (
      <div className={classNames("leaderboard-map", this.props.className)}>
        <SourcedTileLayer
          source={this.mapLayerSource()}
          skipAttribution={true}
        />
        <Rectangle bounds={bounds} />
      </div>
    );
  }
}

LeaderboardMap.propTypes = {
  /** Desired center-point of the map */
  countryCode: PropTypes.string.isRequired,
};

// Wrap with HOC and pass specific map options
export default WithMapContainer(LeaderboardMap, {
  dragging: false,
  scrollWheelZoom: false,
  minZoom: 2,
  maxZoom: 18,
});
