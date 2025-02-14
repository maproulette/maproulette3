import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import { Marker } from "react-leaflet";
import { defaultLayerSource, layerSourceWithId } from "../../services/VisibleLayer/LayerSources";
import SourcedTileLayer from "../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import WithMapContainer from "../HOCs/WithMapContainer/WithMapContainer";
import "./InsetMap.scss";

class InsetMap extends Component {
  render() {
    const layerSource = layerSourceWithId(this.props.layerSourceId) || defaultLayerSource();

    return (
      <div className={classNames("inset-map", this.props.className)}>
        <SourcedTileLayer source={layerSource} skipAttribution={true} />
        <Marker
          position={this.props.centerPoint}
          {...(this.props.markerIcon ? { icon: this.props.markerIcon } : {})}
        />
      </div>
    );
  }
}

InsetMap.propTypes = {
  /** Desired center-point of the map */
  centerPoint: PropTypes.object.isRequired,
  /** Desired zoom of the map */
  fixedZoom: PropTypes.number,
  /** id of default layer to display */
  layerSourceId: PropTypes.string,
};

InsetMap.defaultProps = {
  fixedZoom: 3,
};

export default WithMapContainer(InsetMap);
