import { createControlComponent } from "@react-leaflet/core";
import { Control, DomUtil } from "leaflet";
import ReactDOM from "react-dom";
import React from "react";
import { TaskStatus, TaskStatusColors } from "../../services/Task/TaskStatus/TaskStatus";

/**
 * Leaflet control for displaying a legend with task statuses
 *
 * @private
 */
const StatusLegendLeafletControl = Control.extend({
  onAdd: function (map) {
    // Create a container for the control
    const controlContainer = DomUtil.create("div");

    // Store the collapsed state in the control instance
    this._isCollapsed = this.options.isCollapsed;

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

    const updateUI = () => {
      // Only render content if NOT collapsed
      if (!this._isCollapsed) {
        // Filter the status items based on the activeFilters prop
        let legendItems = allStatusItems;

        if (this.options.activeFilters && this.options.activeFilters.length > 0) {
          legendItems = allStatusItems.filter((item) =>
            this.options.activeFilters.includes(item.id),
          );
        }

        // If no filters are active or all are filtered out, show all statuses
        if (legendItems.length === 0) {
          legendItems = allStatusItems;
        }

        const controlContent = (
          <div className="mr-bg-black-50 mr-text-white mr-p-3 mr-rounded-sm mr-shadow">
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
        );

        ReactDOM.render(controlContent, controlContainer);
      }
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
 * StatusLegendControl is a react-leaflet Control component for displaying a legend.
 */
export const StatusLegendControl = createControlComponent(
  (props) => new StatusLegendLeafletControl(props),
);

export default StatusLegendControl;
