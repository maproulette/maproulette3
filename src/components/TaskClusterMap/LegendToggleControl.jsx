import React, { useState } from "react";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import "leaflet-lasso/dist/leaflet-lasso.esm";
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
          <div className="status-legend">
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

      <style>{`
        .legend-content {
          position: absolute;
          bottom: 60px;
          left: 4px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .status-legend {
          background-color: rgba(255, 255, 255, 0.95);
          line-height: 1;
          border-radius: 4px;
          padding: 4px;
          color: #333;
          width: 115px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.1);
          max-height: 300px;
          overflow-y: auto;
          transition: all 0.2s ease;
        }

        .legend-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #444;
          text-align: center;
        }

        .legend-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 2px;
          font-size: 12px;
        }

        .legend-color-swatch {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          margin-right: 4px;
          flex-shrink: 0;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .legend-label {
          flex: 1;
          font-weight: 500;
        }

        .legend-toggle-button {
          background-color: white;
          border: 1px solid rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }


        .control-icon {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </>
  );
};
