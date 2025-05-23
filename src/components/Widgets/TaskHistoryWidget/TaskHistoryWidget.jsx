import _remove from "lodash/remove";
import { Component, createRef } from "react";
import { FormattedMessage } from "react-intl";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import AsMappableBundle from "../../../interactions/TaskBundle/AsMappableBundle";
import { viewOSMCha } from "../../../services/OSMCha/OSMCha";
import { viewDiffOverpass } from "../../../services/Overpass/Overpass";
import { WidgetDataTarget, registerWidgetType } from "../../../services/Widget/Widget";
import WithSearch from "../../HOCs/WithSearch/WithSearch";
import WithTaskHistory from "../../HOCs/WithTaskHistory/WithTaskHistory";
import QuickWidget from "../../QuickWidget/QuickWidget";
import SignInButton from "../../SignInButton/SignInButton";
import TaskCommentInput from "../../TaskCommentInput/TaskCommentInput";
import TaskHistoryList from "../../TaskHistoryList/TaskHistoryList";
import messages from "./Messages";

const descriptor = {
  widgetKey: "TaskHistoryWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 3,
  defaultHeight: 6,
};

export default class TaskHistoryWidget extends Component {
  state = {
    diffSelectionActive: false,
    selectedTimestamps: [],
  };

  commentInputRef = createRef();

  bbox = () => {
    return this.props.taskBundle
      ? AsMappableBundle(this.props.taskBundle).calculateBBox()
      : AsMappableTask(this.props.task).calculateBBox();
  };

  toggleSelection = (timestamp) => {
    const diffTimestamps = this.state.selectedTimestamps;
    if (diffTimestamps.indexOf(timestamp.toString()) !== -1) {
      _remove(diffTimestamps, timestamp);
    } else {
      diffTimestamps.push(timestamp.toString());
    }

    if (diffTimestamps.length >= 2) {
      viewDiffOverpass(this.bbox(), ...diffTimestamps.slice(-2));
      this.setState({ selectedTimestamps: [], diffSelectionActive: false });
    } else {
      this.setState({ selectedTimestamps: diffTimestamps });
    }
  };

  viewDiff = () => {
    viewDiffOverpass(this.bbox(), ...this.state.selectedTimestamps);
  };

  viewOSMCha = () => {
    let earliestDate = null;
    const usernames = [];

    for (const log of this.props.task.history) {
      if (!earliestDate || log.timestamp < earliestDate) {
        earliestDate = log.timestamp;
      }

      const username = log?.user?.username;
      if (username && usernames.indexOf(username) === -1) {
        usernames.push(username);
      }
    }

    viewOSMCha(this.bbox(), earliestDate, usernames);
  };

  getEditor = () => {
    return this.props.user?.settings?.defaultEditor;
  };

  setComment = (comment) => this.setState({ comment });

  postComment = () => {
    this.props.postTaskComment(this.props.task, this.state.comment).then(() => {
      this.props.reloadHistory();
    });
    this.setComment("");
  };

  editComment = (commentId, comment) => {
    this.props.editTaskComment(this.props.task, commentId, comment).then(() => {
      this.props.reloadHistory();
    });
  };

  render() {
    const loggedIn = localStorage.getItem("isLoggedIn");

    return (
      <QuickWidget
        {...this.props}
        className="task-history-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
        rightHeaderControls={
          <div className="mr-flex mr-justify-between">
            <button className="mr-button mr-button--small mr-mr-2" onClick={this.viewOSMCha}>
              <FormattedMessage {...messages.viewOSMCha} />
            </button>
            {this.state.diffSelectionActive ? (
              <button
                className="mr-button mr-button--small"
                onClick={() => {
                  this.setState({
                    diffSelectionActive: !this.state.diffSelectionActive,
                    selectedTimestamps: [],
                  });
                }}
              >
                <FormattedMessage {...messages.cancelDiff} />
              </button>
            ) : (
              <button
                className="mr-button mr-button--small"
                onClick={() => {
                  this.setState({
                    diffSelectionActive: !this.state.diffSelectionActive,
                    selectedTimestamps: [],
                  });
                }}
              >
                <FormattedMessage {...messages.startDiff} />
              </button>
            )}
          </div>
        }
      >
        {loggedIn ? (
          <div className="mr-my-8 mr-mr-4">
            <TaskCommentInput
              value={this.state.comment}
              commentChanged={this.setComment}
              submitComment={this.postComment}
              taskId={this.props.task.id}
              inputRef={this.commentInputRef}
            />
          </div>
        ) : (
          <div className="mr-flex mr-justify-center mr-my-4">
            <SignInButton {...this.props} longForm />
          </div>
        )}

        <TaskHistoryList
          className="mr-px-4"
          taskHistory={this.props.task.history}
          task={AsMappableTask(this.props.task)}
          editor={this.getEditor()}
          mapBounds={this.props.mapBounds}
          selectDiffs={this.state.diffSelectionActive}
          toggleSelection={this.toggleSelection}
          selectedTimestamps={this.state.selectedTimestamps}
          editComment={this.editComment}
        />
      </QuickWidget>
    );
  }
}

registerWidgetType(WithSearch(WithTaskHistory(TaskHistoryWidget), "task"), descriptor);
