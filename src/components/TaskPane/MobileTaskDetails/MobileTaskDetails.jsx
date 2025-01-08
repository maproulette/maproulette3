import classNames from "classnames";
import _find from "lodash/find";
import _isFunction from "lodash/isFunction";
import _map from "lodash/map";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import ChallengeInfoSummary from "../../ChallengeInfoSummary/ChallengeInfoSummary";
import CommentCountBadge from "../../CommentList/CommentCountBadge/CommentCountBadge";
import CommentList from "../../CommentList/CommentList";
import MarkdownContent from "../../MarkdownContent/MarkdownContent";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import {
  TagDiffWidget,
  TaskCompletionWidget,
  TaskHistoryWidget,
} from "../../Widgets/widget_registry";
import ChallengeShareControls from "../ChallengeShareControls/ChallengeShareControls";
import PlaceDescription from "../PlaceDescription/PlaceDescription";
import TaskInstructions from "../TaskInstructions/TaskInstructions";
import TaskLatLon from "../TaskLatLon/TaskLatLon";
import TaskLocationMap from "../TaskLocationMap/TaskLocationMap";
import TaskRandomnessControl from "../TaskRandomnessControl/TaskRandomnessControl";
import TaskTrackControls from "../TaskTrackControls/TaskTrackControls";
import messages from "./Messages";
import "./MobileTaskDetails.scss";

/**
 * MobileTaskDetails displays a mobile-compatible bottom tab bar with options
 * for displaying various details of the given task and its parent challenge,
 * detail overlays when the user activates a tab.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MobileTaskDetails extends Component {
  paneConfiguration = [
    {
      name: "info",
      icon: "info-icon",
      component: (props) => (
        <div className="mobile-task-details__info">
          <ChallengeInfoSummary {...props} />
          <TaskLocationMap key={this.props.task.id} {...this.props} />
          <PlaceDescription address={this.props.task.place?.address} />
          <TaskLatLon task={this.props.task} />
          <div className="mobile-task-details__info__description">
            <MarkdownContent
              markdown={this.props.task.parent.description || this.props.task.parent.blurb}
            />
          </div>
        </div>
      ),
    },
    {
      name: "instructions",
      icon: "help-icon",
      component: (props) => (
        <div className="mobile-task-details__instructions">
          <h3 className="title is-4">
            <FormattedMessage {...messages.instructions} />
          </h3>
          <TaskInstructions {...props} />
        </div>
      ),
    },
    {
      name: "edit",
      icon: "evaluate-icon",
      component: (props) => (console.log(props.task), (<TaskCompletionWidget {...props} />)),
    },
    {
      name: "tags",
      icon: "pencil-icon",
      component: (props) =>
        AsCooperativeWork(this.props.task).isTagType() ? (
          <TagDiffWidget {...props} />
        ) : (
          <TaskHistoryWidget {...props} />
        ),
    },
    {
      name: "comments",
      icon: (props) => <CommentCountBadge comments={props.task?.comments} />,
      component: (props) => (
        <div className="mobile-task-details__comments">
          <CommentList comments={props.task.comments} />
        </div>
      ),
    },
    {
      name: "options",
      icon: "navigation-more-icon",
      component: (props) => (
        <div className="mobile-task-details__more-options">
          <TaskTrackControls {...props} />
          <TaskRandomnessControl {...props} />
          <ChallengeShareControls challenge={props.task.parent} />
        </div>
      ),
    },
  ];

  state = {
    activePaneName: null,
  };

  togglePane = (paneName) => {
    this.setState({
      activePaneName: this.state.activePaneName === paneName ? null : paneName,
    });
  };

  render() {
    if (!this.props.task) {
      return null;
    }

    const paneTabs = _map(this.paneConfiguration, (pane) => (
      <div
        key={pane.name}
        className={classNames("mobile-task-details__tab-bar__control", {
          active: this.state.activePaneName === pane.name,
        })}
        onClick={() => this.togglePane(pane.name)}
      >
        {_isFunction(pane.icon) ? (
          pane.icon(this.props)
        ) : (
          <SvgSymbol viewBox="0 0 20 20" sym={pane.icon} />
        )}
      </div>
    ));

    let activePane = null;
    if (this.state.activePaneName) {
      const configuration = _find(this.paneConfiguration, { name: this.state.activePaneName });

      activePane = configuration ? configuration.component(this.props) : null;
    }

    // Note that we show "minimized" active pane when nothing is active so that
    // we can do CSS transitions.
    return (
      <div className="mobile-task-details">
        <div className={classNames("mobile-task-details__active-pane", { minimized: !activePane })}>
          {activePane && (
            <div className="mobile-task-details__active-pane__pane-controls">
              <span className="delete" onClick={() => this.togglePane(this.state.activePaneName)} />
            </div>
          )}

          {activePane}
        </div>

        <div className="mobile-task-details__tab-bar">{paneTabs}</div>
      </div>
    );
  }
}
