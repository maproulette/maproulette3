import L from "leaflet";
import PropTypes from "prop-types";
import { Component } from "react";
import Dropzone from "react-dropzone";
import { FormattedMessage, injectIntl } from "react-intl";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { countTasksInBoundingGeometries } from "../../services/VirtualChallenge/VirtualChallenge";
import BusySpinner from "../BusySpinner/BusySpinner";
import External from "../External/External";
import Modal from "../Modal/Modal";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

const MAX_VIRTUAL_CHALLENGE_TASKS = 2000;

/**
 * GeoJSONUploadModal provides a modal with a dropzone for uploading a GeoJSON
 * file to create a virtual challenge. It parses polygon features from the file,
 * shows a map preview of the polygons, prompts for a challenge name, and
 * initiates creation.
 */
class GeoJSONUploadModal extends Component {
  state = {
    parsedClusters: null,
    parsedFeatureCollection: null,
    challengeName: "",
    error: null,
    successMessage: null,
    creating: false,
    taskCount: null,
    countingTasks: false,
  };

  handleFileDrop = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    this.setState({
      error: null,
      successMessage: null,
      parsedClusters: null,
      parsedFeatureCollection: null,
    });

    try {
      const text = await file.text();
      const geoJson = JSON.parse(text);

      let features = [];
      if (geoJson.type === "FeatureCollection" && Array.isArray(geoJson.features)) {
        features = geoJson.features;
      } else if (geoJson.type === "Feature") {
        features = [geoJson];
      } else if (geoJson.type === "Polygon" || geoJson.type === "MultiPolygon") {
        features = [{ type: "Feature", geometry: geoJson, properties: {} }];
      } else {
        throw new Error("Unsupported GeoJSON type");
      }

      const polygonFeatures = features.filter(
        (f) => f.geometry && (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"),
      );

      if (polygonFeatures.length === 0) {
        this.setState({
          error: this.props.intl.formatMessage(messages.noPolygonsFound),
        });
        return;
      }

      const clusters = polygonFeatures.map((feature, index) => ({
        bounding: feature.geometry,
        numberOfPoints: 0,
        clusterId: `geojson-${index}`,
      }));

      const featureCollection = {
        type: "FeatureCollection",
        features: polygonFeatures,
      };

      this.setState({
        parsedClusters: clusters,
        parsedFeatureCollection: featureCollection,
        successMessage: this.props.intl.formatMessage(messages.polygonsLoaded, {
          count: polygonFeatures.length,
        }),
        countingTasks: true,
        taskCount: null,
      });

      // Count tasks within the polygons
      countTasksInBoundingGeometries(clusters, this.props.challengeId)
        .then((count) => {
          this.setState({ taskCount: count, countingTasks: false });
        })
        .catch(() => {
          this.setState({ taskCount: null, countingTasks: false });
        });
    } catch (error) {
      this.setState({
        error: this.props.intl.formatMessage(messages.invalidGeoJSON, {
          error: error.message,
        }),
      });
    }
  };

  exceedsTaskLimit = () => {
    return this.state.taskCount !== null && this.state.taskCount > MAX_VIRTUAL_CHALLENGE_TASKS;
  };

  isTaskCountValid = () => {
    return (
      !this.state.countingTasks &&
      this.state.taskCount !== null &&
      this.state.taskCount > 0 &&
      this.state.taskCount <= MAX_VIRTUAL_CHALLENGE_TASKS
    );
  };

  handleCreate = () => {
    if (!this.state.parsedClusters || !this.state.challengeName.trim()) return;
    if (!this.isTaskCountValid()) return;

    this.setState({ creating: true });
    this.props
      .createVirtualChallenge(
        this.state.challengeName,
        this.state.parsedClusters,
        this.props.challengeId,
      )
      .catch(() => null)
      .then(() => {
        this.setState({ creating: false });
        this.props.onClose();
      });
  };

  render() {
    return (
      <External>
        <Modal medium isActive onClose={this.props.onClose}>
          <div>
            <h2 className="mr-text-white mr-text-3xl mr-mb-4">
              <FormattedMessage {...messages.header} />
            </h2>

            {this.state.creating ? (
              <BusySpinner />
            ) : (
              <div>
                {/* Dropzone */}
                <Dropzone
                  acceptClassName="active"
                  multiple={false}
                  disablePreview
                  onDrop={this.handleFileDrop}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div
                      className="dropzone mr-text-green-lighter mr-border-green-lighter mr-border-2 mr-rounded mr-p-6 mr-mx-auto mr-cursor-pointer mr-text-center"
                      {...getRootProps()}
                    >
                      <input {...getInputProps()} />
                      <SvgSymbol
                        viewBox="0 0 20 20"
                        sym="upload-icon"
                        className="mr-fill-current mr-w-6 mr-h-6 mr-mx-auto mr-mb-2"
                      />
                      <FormattedMessage {...messages.dropzoneLabel} />
                    </div>
                  )}
                </Dropzone>

                {/* Error feedback */}
                {this.state.error && (
                  <div className="mr-text-red-light mr-text-sm mr-mt-2">{this.state.error}</div>
                )}

                {/* Success feedback */}
                {this.state.successMessage && (
                  <div className="mr-text-green-lighter mr-text-sm mr-mt-2">
                    {this.state.successMessage}
                  </div>
                )}

                {/* Map preview of parsed polygons */}
                {this.state.parsedFeatureCollection && (
                  <div className="mr-mt-4 mr-rounded mr-overflow-hidden mr-border mr-border-white-10">
                    <MapContainer
                      center={[0, 0]}
                      zoom={2}
                      style={{ height: "300px", width: "100%" }}
                      attributionControl={false}
                      whenReady={({ target: map }) => {
                        // Fit to GeoJSON bounds once map is ready
                        const geoJSONLayer = L.geoJSON(this.state.parsedFeatureCollection);
                        const bounds = geoJSONLayer.getBounds();
                        if (bounds.isValid()) {
                          map.fitBounds(bounds.pad(0.1));
                        }
                      }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <GeoJSON
                        data={this.state.parsedFeatureCollection}
                        style={{
                          color: "#4ade80",
                          weight: 2,
                          fillColor: "#4ade80",
                          fillOpacity: 0.15,
                        }}
                      />
                    </MapContainer>
                  </div>
                )}

                {/* Task count feedback */}
                {this.state.parsedClusters && (
                  <div className="mr-mt-2">
                    {this.state.countingTasks && (
                      <div className="mr-text-yellow mr-text-sm">
                        <FormattedMessage {...messages.countingTasks} />
                      </div>
                    )}
                    {this.state.taskCount !== null && !this.exceedsTaskLimit() && (
                      <div className="mr-text-green-lighter mr-text-sm">
                        <FormattedMessage
                          {...messages.taskCount}
                          values={{ count: this.state.taskCount }}
                        />
                      </div>
                    )}
                    {this.exceedsTaskLimit() && (
                      <div className="mr-text-red-light mr-text-sm">
                        <FormattedMessage
                          {...messages.tooManyTasks}
                          values={{ count: this.state.taskCount, max: MAX_VIRTUAL_CHALLENGE_TASKS }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Name input + create button (shown after successful parse) */}
                {this.state.parsedClusters && !this.exceedsTaskLimit() && (
                  <div className="mr-mt-4">
                    <input
                      type="text"
                      className="mr-input mr-w-full mr-mb-4"
                      placeholder={this.props.intl.formatMessage(messages.nameLabel)}
                      value={this.state.challengeName}
                      onChange={(e) => this.setState({ challengeName: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") this.handleCreate();
                      }}
                      autoFocus
                    />
                    <div className="mr-flex mr-justify-end mr-items-center mr-gap-4">
                      <button className="mr-button mr-button--white" onClick={this.props.onClose}>
                        <FormattedMessage {...messages.cancelLabel} />
                      </button>
                      <button
                        className="mr-button"
                        onClick={this.handleCreate}
                        disabled={!this.state.challengeName.trim() || !this.isTaskCountValid()}
                      >
                        <FormattedMessage {...messages.startLabel} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel button (shown before parse) */}
                {!this.state.parsedClusters && (
                  <div className="mr-flex mr-justify-end mr-items-center mr-mt-4">
                    <button className="mr-button mr-button--white" onClick={this.props.onClose}>
                      <FormattedMessage {...messages.cancelLabel} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      </External>
    );
  }
}

GeoJSONUploadModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  createVirtualChallenge: PropTypes.func.isRequired,
  /** When set, restricts virtual challenge tasks to this challenge */
  challengeId: PropTypes.number,
};

export default injectIntl(GeoJSONUploadModal);
