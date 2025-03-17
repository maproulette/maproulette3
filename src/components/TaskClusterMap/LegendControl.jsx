import { createControlComponent } from "@react-leaflet/core";
import { Control, DomUtil } from "leaflet";
import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { TaskStatus, TaskStatusColors } from "../../services/Task/TaskStatus/TaskStatus";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

/**
 * Leaflet control for displaying a collapsible legend with task statuses
 *
 * @private
 */
const LegendLeafletControl = Control.extend({
  onAdd: function (map) {
    // Create a container for the control
    const controlContainer = DomUtil.create("div");

    // Store the collapsed state in the control instance
    this._isCollapsed = this.options.isCollapsed !== undefined ? this.options.isCollapsed : true;

    // Define all possible status items
    const allStatusItems = [
      { id: TaskStatus.created, color: TaskStatusColors[TaskStatus.created], status: "Created" },
      { id: TaskStatus.fixed, color: TaskStatusColors[TaskStatus.fixed], status: "Fixed" },
      {
        id: TaskStatus.falsePositive,
        color: TaskStatusColors[TaskStatus.falsePositive],
        status: "Not an Issue",
      },
      { id: TaskStatus.skipped, color: TaskStatusColors[TaskStatus.skipped], status: "Skipped" },
      { id: TaskStatus.deleted, color: TaskStatusColors[TaskStatus.deleted], status: "Deleted" },
      {
        id: TaskStatus.alreadyFixed,
        color: TaskStatusColors[TaskStatus.alreadyFixed],
        status: "Already Fixed",
      },
      {
        id: TaskStatus.tooHard,
        color: TaskStatusColors[TaskStatus.tooHard],
        status: "Can't Complete",
      },
      { id: TaskStatus.disabled, color: TaskStatusColors[TaskStatus.disabled], status: "Disabled" },
    ];

    // Create a function to update the control UI
    const updateUI = () => {
      // Filter the status items based on the activeFilters prop
      let legendItems = allStatusItems;

      if (this.options.activeFilters && this.options.activeFilters.length > 0) {
        legendItems = allStatusItems.filter((item) => this.options.activeFilters.includes(item.id));
      }

      // If no filters are active or all are filtered out, show all statuses
      if (legendItems.length === 0) {
        legendItems = allStatusItems;
      }

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
            className="mr-leading-none mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-justify-center mr-rounded-sm mr-shadow mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
            title={this._isCollapsed ? "Show Legend" : "Hide Legend"}
          >
            <SvgSymbol
              sym="info-icon"
              className="mr-w-5 mr-h-5 mr-fill-current mr-stroke-current"
              viewBox="0 0 20 20"
            />
          </button>

          {!this._isCollapsed && (
            <div className="mr-bg-black-50 mr-text-white mr-p-3 mr-rounded-sm mr-shadow mr-mt-1">
              <h3 className="mr-text-sm mr-font-bold mr-mb-2">Status Legend</h3>
              <ul className="mr-list-none mr-p-0 mr-m-0">
                {legendItems.map((item, index) => (
                  <li key={index} className="mr-flex mr-items-center mr-mb-1 mr-text-xs">
                    <span
                      className="mr-inline-block mr-w-3 mr-h-3 mr-rounded-full mr-mr-2"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    {item.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

  update: function (props) {
    // Update options with new props
    this.options = { ...this.options, ...props };

    // Update collapsed state if it was explicitly provided in props
    if (props.isCollapsed !== undefined) {
      this._isCollapsed = props.isCollapsed;
    }

    if (props.activeFilters !== undefined) {
      this.options.activeFilters = props.activeFilters;
    }

    // Re-render UI with updated props
    this._updateUI && this._updateUI();
  },
});

/**
 * LegendControl is a react-leaflet Control component for displaying a collapsible legend.
 */
export const LegendControl = createControlComponent(
  (props) =>
    new LegendLeafletControl({
      position: "topleft",
      ...props,
    }),
);

export default LegendControl;
