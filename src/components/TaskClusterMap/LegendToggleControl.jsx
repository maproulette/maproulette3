import { createControlComponent } from "@react-leaflet/core";
import { Control, DomUtil } from "leaflet";
import { Fragment } from "react";
import ReactDOM from "react-dom";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

/**
 * Leaflet control for toggling the legend visibility
 *
 * @private
 */
const LegendToggleLeafletControl = Control.extend({
  onAdd: function (map) {
    // Create a container for the control
    const controlContainer = L.DomUtil.create("div");

    // Store the collapsed state in the control instance
    this._isCollapsed = this.options.isCollapsed;

    // Create a function to update the control UI
    const updateUI = () => {
      // Create the React element
      const controlContent = (
        <Fragment>
          <button
            onClick={() => {
              this._isCollapsed = !this._isCollapsed;
              this.options.onToggle && this.options.onToggle(this._isCollapsed);
              // Re-render with updated state
              updateUI();
            }}
            className="mr-leading-none mr-bg-black-50 mr-text-white mr-w-8 mr-h-4 mr-flex mr-items-center mr-rounded-sm mr-shadow mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
            title={this._isCollapsed ? "Hide Legend" : "Show Legend"}
          >
            <SvgSymbol
              sym={this._isCollapsed ? "info-icon" : "info-icon"}
              className="mr-w-8 mr-h-4 mr-fill-current mr-stroke-current"
              viewBox="0 0 20 20"
            />
          </button>
        </Fragment>
      );

      // Render the React element to the container
      ReactDOM.render(controlContent, controlContainer);
    };

    // Initial render
    updateUI();

    return controlContainer;
  },
});

/**
 * LegendToggleControl is a react-leaflet Control component for toggling
 * the visibility of the legend.
 */
export const LegendToggleControl = createControlComponent(
  (props) =>
    new LegendToggleLeafletControl({
      position: "topright",
      ...props,
    }),
);

export default LegendToggleControl;
