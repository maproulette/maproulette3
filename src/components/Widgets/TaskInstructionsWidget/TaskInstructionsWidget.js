import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";
import _get from "lodash/get";
import _isFinite from "lodash/isFinite";
import {
  WidgetDataTarget,
  registerWidgetType,
} from "../../../services/Widget/Widget";
import TaskInstructions from "../../TaskPane/TaskInstructions/TaskInstructions";
import QuickWidget from "../../QuickWidget/QuickWidget";
import messages from "./Messages";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";

const descriptor = {
  widgetKey: "TaskInstructionsWidget",
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 2,
  defaultHeight: 6,
};

export default class TaskInstructionsWidget extends Component {
  state = {
    /**
     * Since the API is involved, collapsing the widget takes an undeterminable amount of time
     * and needs a loader to account for it.
     */
    collapsing: false,
    expandedOnLoad: false,
  };

  resetLoader = () => {
    this.setState({ collapsing: false });
  };

  /**
   * Invoked to toggle minimization of the challenge instructions. If the user
   * is working through a virtual challenge, we nevertheless set the preference
   * on the actual challenge being worked on (not the virtual challenge) as the
   * instructions will obviously vary from challenge to challenge if the user
   * works through tasks from multiple challenges.
   */
  toggleMinimized = () => {
    this.setState({ collapsing: true });
    const challengeId = _get(this.props.task, "parent.id");
    if (_isFinite(challengeId)) {
      if (!this.props.collapseInstructions) {
        // Save our current height before collapsing so that we can restore it
        // later (as our actual height from the widget workspace will reflect
        // our collapsed state)
        this.props.updateWidgetConfiguration({
          expandedHeight: this.props.widgetLayout.h,
        });
      }

      this.props.setInstructionsCollapsed(
        challengeId,
        false,
        !this.props.collapseInstructions
      );
    }

    //this is not ideal, but it will prevent spam clicks until a more asynchronous flow is built for this toggle
    setTimeout(this.resetLoader, 800);
  };

  adjustHeightForMinimization = () => {
    if (
      this.props.collapseInstructions &&
      this.props.widgetLayout.h > descriptor.minHeight
    ) {
      this.props.updateWidgetHeight(
        this.props.widgetLayout.i,
        descriptor.minHeight
      );
    } else if (
      !this.props.collapseInstructions &&
      this.props.widgetLayout.h === descriptor.minHeight
    ) {
      this.props.updateWidgetHeight(
        this.props.widgetLayout.i,
        _isFinite(this.props.widgetConfiguration.expandedHeight)
          ? this.props.widgetConfiguration.expandedHeight
          : descriptor.defaultHeight
      );
    }
  };

  componentDidMount() {
    this.adjustHeightForMinimization();
  }

  componentDidUpdate(prevProps) {
    //When the page loads, the instructions widget should be expanded. Unfortunately this can't be checked
    //onmount so it is checked here for now.  Refactor needed.
    if (!this.state.expandedOnLoad) {
      this.setState({ expandedOnLoad: true });

      const { expandedHeight } = this.props.widgetConfiguration;

      //Users who spam clicked and have bad user settings need this check.
      //Ssomehow expandedHeight becomes the minHeight when a race condition occurs
      const height =
        expandedHeight === descriptor.minHeight
          ? descriptor.defaultHeight
          : expandedHeight;

      return this.props.updateWidgetHeight(this.props.widgetLayout.i, height);
    }

    if (prevProps.collapseInstructions !== this.props.collapseInstructions) {
      this.adjustHeightForMinimization();
    }
  }

  render() {
    const minimizeControl = (
      <button
        className="mr-text-green-lighter"
        onClick={this.toggleMinimized}
        disabled={this.state.collapsing}
      >
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-transition mr-fill-current mr-min-w-6 mr-w-6 mr-h-6"
        />
      </button>
    );

    return (
      <QuickWidget
        {...this.props}
        className={classNames("task-instructions-widget", {
          "is-expanded": !this.props.collapseInstructions,
        })}
        widgetTitle={<FormattedMessage {...messages.title} />}
        rightHeaderControls={minimizeControl}
      >
        {!this.props.collapseInstructions && (
          <TaskInstructions {...this.props} />
        )}
      </QuickWidget>
    );
  }
}

TaskInstructionsWidget.propTypes = {
  collapseInstructions: PropTypes.bool,
  setInstructionsCollapsed: PropTypes.func.isRequired,
};

registerWidgetType(TaskInstructionsWidget, descriptor);
