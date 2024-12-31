import bbox from "@turf/bbox";
import classNames from "classnames";
import _split from "lodash/split";
import { Component, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { AttributionControl, MapContainer, ZoomControl } from "react-leaflet";
import { fromLatLngBounds, toLatLngBounds } from "../../services/MapBounds/MapBounds";
import { DEFAULT_MAP_BOUNDS } from "../../services/MapBounds/MapBounds";
import { defaultLayerSource } from "../../services/VisibleLayer/LayerSources";
import AreaSelect from "../AreaSelect/AreaSelect";
import MapPane from "../EnhancedMap/MapPane/MapPane";
import SourcedTileLayer from "../EnhancedMap/SourcedTileLayer/SourcedTileLayer";
import External from "../External/External";
import Modal from "../Modal/Modal";
import messages from "./Messages";

/**
 * BoundsSelectorModal presents a modal that displays a
 * map on which a bounding box can be selected.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class BoundsSelectorModal extends Component {
  state = {
    active: false,
    lat: 0,
    lng: 0,
  };

  dismiss = (defaultBounds) => {
    this.setState({ active: false });

    if (this.state.mapBounds || defaultBounds) {
      const bbox = fromLatLngBounds(this.state.mapBounds || defaultBounds);

      if (bbox) {
        this.props.onChange(bbox.join(","));
      }
    }
  };

  render() {
    const boundingBox = toLatLngBounds(
      this.props.value && _split(this.props.value, ",").length === 4
        ? _split(this.props.value, ",")
        : this.props.bounding
          ? bbox(this.props.bounding)
          : DEFAULT_MAP_BOUNDS,
    );

    return (
      <Fragment>
        <button
          className="mr-button mr-button mr-button--small mr-ml-4"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            this.setState({ active: true });
          }}
        >
          {this.props.buttonName}
        </button>

        {this.state.active && (
          <External>
            <Modal isActive wide onClose={() => this.dismiss()}>
              <div className="mr-overflow-y-auto mr-max-h-screen80">
                <div className="mr-bg-blue-dark mr-p-8 mr-text-white mr-text-center">
                  <div>
                    <h2 className="mr-text-yellow mr-text-2xl mr-mb-2">
                      <FormattedMessage {...messages.header} />
                    </h2>
                    <div className="form mr-mt-2 mr-py-2">
                      <p className="mr-mr-4 mr-text-md">
                        <FormattedMessage {...messages.primaryMessage} />
                      </p>
                    </div>
                  </div>
                  <div className={classNames("mr-bounds-selector-map", this.props.className)}>
                    <MapPane>
                      <MapContainer
                        bounds={boundingBox}
                        zoomControl={false}
                        minZoom={2}
                        maxZoom={18}
                        attributionControl={false}
                        maxBounds={[
                          [-90, -180],
                          [90, 180],
                        ]}
                      >
                        <AttributionControl position="bottomleft" prefix={false} />
                        <ZoomControl className="mr-z-1000" position="topright" />
                        <SourcedTileLayer source={defaultLayerSource()} skipAttribution={true} />
                        <AreaSelect
                          bounds={boundingBox}
                          onBoundsChanged={(mapBounds) => this.setState({ mapBounds })}
                        />
                      </MapContainer>
                    </MapPane>
                  </div>
                  <div className="mr-text-center mr-mt-6">
                    <button className="mr-button" onClick={() => this.dismiss(boundingBox)}>
                      <FormattedMessage {...messages.dismiss} />
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </External>
        )}
      </Fragment>
    );
  }
}
