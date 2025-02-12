import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import { messagesByPriority } from "../../../services/Task/TaskPriority/TaskPriority";
import { messagesByStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import messages from "./Messages";

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

    return (
      <div className="mr-flex mr-justify-center">
        <div className="mr-flex-col mr-w-full">
          <div className="mr-flex">
            <div className="mr-w-1/2 mr-mr-2 mr-text-right">
              <FormattedMessage {...messages.nameLabel} />
            </div>
            <div className="mr-w-1/2 mr-text-left">
              {this.props.marker.options.name ||
                this.props.marker.options.geometries?.features[0]?.id}
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
