import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import AsIdentifiableFeature from "../../../interactions/TaskFeature/AsIdentifiableFeature";
import { loadObjectsIntoJOSM } from "../../../services/Editor/Editor";
import { messagesByPriority } from "../../../services/Task/TaskPriority/TaskPriority";
import { messagesByStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import messages from "./Messages";

const osmIdForFeature = (feature) => {
  if (!feature) return null;
  const identifiable = AsIdentifiableFeature(feature);
  const osmId = identifiable.osmId();
  const osmType = identifiable.osmType();
  if (!osmId || !osmType) return null;
  return `${osmType[0]}${osmId}`;
};

/**
 * The content to show in the popup when a task marker is clicked.
 */
class TaskMarkerContent extends Component {
  render() {
    const statusMessage =
      messagesByStatus[this.props.marker.options.status ?? this.props.marker.options.taskStatus];
    const priorityMessage =
      messagesByPriority[
        this.props.marker.options.priority ?? this.props.marker.options.taskPriority
      ];

    const firstFeature = this.props.marker.options.geometries?.features?.[0];
    const josmId = osmIdForFeature(firstFeature);
    const nameValue = josmId || this.props.marker.options.name || firstFeature?.id;

    return (
      <div className="mr-flex mr-justify-center">
        <div className="mr-flex-col mr-w-full">
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right">
              <FormattedMessage {...messages.nameLabel} />
            </div>
            <div className="mr-w-1/2 mr-text-left">
              {josmId ? (
                <a
                  href={`http://127.0.0.1:8111/load_object?objects=${josmId}&new_layer=true`}
                  onClick={(e) => {
                    e.preventDefault();
                    loadObjectsIntoJOSM([josmId], true);
                  }}
                  title="Open in JOSM"
                >
                  {nameValue}
                </a>
              ) : (
                nameValue
              )}
            </div>
          </div>

          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right">
              <FormattedMessage {...messages.taskIdLabel} />
            </div>
            <div className="mr-w-1/2 mr-text-left">
              <Link
                to={`/challenge/${this.props.challengeId}/task/${this.props.marker.options.taskId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {this.props.marker.options.taskId}
              </Link>
            </div>
          </div>

          {statusMessage && (
            <div className="mr-flex">
              <div className="mr-w-1/2 mr-mr-2 mr-text-right">
                <FormattedMessage {...messages.statusLabel} />
              </div>
              <div className="mr-w-1/2 mr-text-left">
                {this.props.intl.formatMessage(statusMessage)}
              </div>
            </div>
          )}

          {priorityMessage && (
            <div className="mr-flex">
              <div className="mr-w-1/2 mr-mr-2 mr-text-right">
                <FormattedMessage {...messages.priorityLabel} />
              </div>
              <div className="mr-w-1/2 mr-text-left">
                {this.props.intl.formatMessage(priorityMessage)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default TaskMarkerContent;
