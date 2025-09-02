import PropTypes from "prop-types";
import React from "react";
import { FormattedMessage } from "react-intl";
import AppErrors from "../../services/Error/AppErrors";

/**
 * Error boundary component that provides a black screen fallback
 * when tile layer rendering fails
 */
class TileLayerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.sourceId !== this.props.sourceId) {
      this.setState({ hasError: false });
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tile layer error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000000",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "14px",
            padding: "60px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <FormattedMessage
              {...AppErrors.map.renderFailure}
              values={{ details: "map layer unavailable" }}
            />
            <div style={{ marginTop: "10px", fontSize: "12px", opacity: 0.8 }}>
              <FormattedMessage
                id="TileLayerErrorBoundary.retryMessage"
                defaultMessage="Please refresh the page to retry"
              />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

TileLayerErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  sourceId: PropTypes.string,
};

export default TileLayerErrorBoundary;
