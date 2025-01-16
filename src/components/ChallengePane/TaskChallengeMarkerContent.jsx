import { Component } from "react";
import WithLoadedTask from "../HOCs/WithLoadedTask/WithLoadedTask";
import messages from "./Messages";

/**
 * The content to show in the popup when a task marker is clicked.
 */
class TaskChallengeMarkerContent extends Component {
  render() {
    const markerData = this.props.marker;
    let challengeId = markerData.options.parentId || this.props.task?.parent?.id;
    if (!challengeId && (markerData.options?.challengeIds?.length ?? 0) === 1) {
      challengeId = markerData.options.challengeIds[0];
    }

    return (
      <div>
        <h3>
          <div className="mr-text-left mr-text-grey">
            <h4>{this.props.intl.formatMessage(messages.taskInfoLabel)}</h4>
            <div className="mr-text-sm">
              {this.props.intl.formatMessage(messages.taskNameLabel)}{" "}
              {markerData.options.name || this.props.task?.name}
              <br />
              {this.props.intl.formatMessage(messages.taskIdLabel)}{" "}
              <a
                onClick={() => {
                  this.props.startChallengeWithTask(challengeId, false, markerData.options.taskId);
                }}
              >
                {markerData.options.id || this.props.task?.id}
              </a>
              <br />
              {this.props.intl.formatMessage(messages.challengeNameLabel)}{" "}
              {markerData.options.parentName || this.props.task?.parent?.name}
              <br />
              {this.props.intl.formatMessage(messages.challengeIdLabel)}{" "}
              <a onClick={() => this.props.history.push(`/browse/challenges/${challengeId}`)}>
                {markerData.options.parentId || this.props.task?.parent?.id}
              </a>
            </div>
          </div>
        </h3>

        <div className="marker-popup-content__links">
          <div>
            <a
              onClick={() => {
                this.props.startChallengeWithTask(challengeId, false, markerData.options.taskId);
              }}
            >
              {this.props.intl.formatMessage(messages.startTaskLabel)}{" "}
              {markerData.options.id || this.props.task?.id}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default WithLoadedTask(TaskChallengeMarkerContent);
