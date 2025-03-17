import { createControlComponent } from "@react-leaflet/core";
import L from "leaflet";
import { Fragment } from "react";
import ReactDOM from "react-dom";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

/**
 * Leaflet control for toggling the visibility of other map controls
 *
 * @private
 */
const ControlsToggleLeafletControl = L.Control.extend({
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
            title={this._isCollapsed ? "Show controls" : "Hide controls"}
          >
            <SvgSymbol
              sym={this._isCollapsed ? "hidden-icon" : "visible-icon"}
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

    // Store updateUI function for use in update method
    this._updateUI = updateUI;

    return controlContainer;
  },

  // Add update method to handle prop changes
  update: function (props) {
    // Update options with new props
    this.options = { ...this.options, ...props };

    // Update collapsed state if it was explicitly provided in props
    if (props.isCollapsed !== undefined) {
      this._isCollapsed = props.isCollapsed;
    }

    // Re-render UI with updated props
    this._updateUI && this._updateUI();
  },
});
/**
 * ControlsToggle is a react-leaflet Control component for toggling
 * the visibility of other map controls.
 */
export const ControlsToggle = createControlComponent(
  (props) => new ControlsToggleLeafletControl(props),
);

export default ControlsToggle;
