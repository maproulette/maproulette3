import React, { useState } from "react";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import "leaflet-lasso/dist/leaflet-lasso.esm";
import _compact from "lodash/compact";
import _map from "lodash/map";
import { TaskStatus, TaskStatusColors } from "../../services/Task/TaskStatus/TaskStatus";

/**
 * LegendToggleControl renders a legend toggle button on the right side of the map
 * containing all map controls.
 */
export const LegendToggleControl = () => {
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <>
      {/* Status Legend - Now toggleable */}
      <div className="legend-content">
        {legendOpen && (
          <div className="status-legend mr-bg-green">
            <div className="legend-header">
              <h3 className="legend-title">Status Legend</h3>
            </div>
            <ul className="legend-list">
              {[
                {
                  id: TaskStatus.created,
                  color: TaskStatusColors[TaskStatus.created],
                  status: "Created",
                },
                {
                  id: TaskStatus.fixed,
                  color: TaskStatusColors[TaskStatus.fixed],
                  status: "Fixed",
                },
                {
                  id: TaskStatus.falsePositive,
                  color: TaskStatusColors[TaskStatus.falsePositive],
                  status: "Not an Issue",
                },
                {
                  id: TaskStatus.skipped,
                  color: TaskStatusColors[TaskStatus.skipped],
                  status: "Skipped",
                },
                {
                  id: TaskStatus.deleted,
                  color: TaskStatusColors[TaskStatus.deleted],
                  status: "Deleted",
                },
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
                {
                  id: TaskStatus.disabled,
                  color: TaskStatusColors[TaskStatus.disabled],
                  status: "Disabled",
                },
              ].map((item) => (
                <li key={item.id} className="legend-item">
                  <span className="legend-color-swatch" style={{ backgroundColor: item.color }} />
                  <span className="legend-label">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="control-item">
          <button
            className="legend-toggle-button"
            onClick={() => setLegendOpen(!legendOpen)}
            title="Toggle Legend"
            aria-label="Toggle Legend"
          >
            <SvgSymbol sym="legend-icon" viewBox="0 0 20 20" className="control-icon" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .legend-content {
          position: absolute;
          bottom: 60px;
          left: 4px;
          z-index: 1000;
          width: 130px;
        }

        .status-legend {
          line-height: 1;
          border-radius: 4px;
          padding: 8px;
          color: white;
          width: 130px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .legend-header {
          margin-bottom: 8px;
        }

        .legend-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .legend-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .legend-color-swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .legend-label {
          flex: 1;
        }
      `}</style>
    </>
  );
};
