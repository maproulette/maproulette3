import classNames from "classnames";
import _compact from "lodash/compact";
import _isFinite from "lodash/isFinite";
import _kebabCase from "lodash/kebabCase";
import _map from "lodash/map";
import { Component, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import TaskCommentsModal from "../../components/TaskCommentsModal/TaskCommentsModal";
import {
  keysByReviewStatus,
  messagesByReviewStatus,
} from "../../services/Task/TaskReview/TaskReviewStatus";
import { keysByStatus, messagesByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import { WidgetDataTarget, registerWidgetType } from "../../services/Widget/Widget";
import Dropdown from "../Dropdown/Dropdown";
import QuickWidget from "../QuickWidget/QuickWidget";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

const descriptor = {
  widgetKey: "SavedTasksWidget",
  label: messages.header,
  targets: [WidgetDataTarget.user],
  minWidth: 3,
  defaultWidth: 4,
  minHeight: 2,
  defaultHeight: 5,
};

export default class SavedTasksWidget extends Component {
  state = {
    openComments: null,
  };

  componentDidMount() {
    if (this.props.user && this.props.fetchSavedTasks) {
      this.props.fetchSavedTasks(this.props.user.id);
    }
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="saved-tasks-widget"
        widgetTitle={<FormattedMessage {...messages.header} />}
      >
        <SavedTaskList
          {...this.props}
          openComments={(taskId) => this.setState({ openComments: taskId })}
        />
        {_isFinite(this.state.openComments) && (
          <TaskCommentsModal
            taskId={this.state.openComments}
            onClose={() => this.setState({ openComments: null })}
          />
        )}
      </QuickWidget>
    );
  }
}

const SavedTaskList = function (props) {
  const taskItems = _compact(
    _map(props.user?.savedTasks ?? [], (task) => {
      if (!_isFinite(task?.parent?.id)) {
        return null;
      }

      return (
        <Fragment key={task.id}>
          <div className="mr-col-span-5">
            <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>{task.name}</Link>
            <div className="mr-links-grey-light">
              <Link to={`/browse/challenges/${task.parent.id}`}>{task.parent.name}</Link>
            </div>
          </div>
          <div
            className={classNames(
              "mr-col-span-3",
              `mr-status-${_kebabCase(keysByStatus[task.status])}`,
            )}
          >
            <FormattedMessage {...messagesByStatus[task.status]} />
          </div>
          <div
            className={classNames(
              "mr-col-span-3",
              `mr-review-${_kebabCase(keysByReviewStatus[task.reviewStatus])}`,
            )}
          >
            {_isFinite(task.reviewStatus) ? (
              <FormattedMessage {...messagesByReviewStatus[task.reviewStatus]} />
            ) : (
              <span />
            )}
          </div>
          <div className="mr-h-5 mr-text-right">
            <Dropdown
              className="mr-dropdown--right"
              dropdownButton={(dropdown) => (
                <button
                  onClick={dropdown.toggleDropdownVisible}
                  className="mr-flex mr-items-center mr-text-white-40"
                >
                  <SvgSymbol
                    sym="navigation-more-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-5 mr-h-5"
                  />
                </button>
              )}
              dropdownContent={() => (
                <ul className="mr-list-dropdown mr-links-green-lighter">
                  <li>
                    <Link to={`/challenge/${task.parent.id}/task/${task.id}`}>
                      <FormattedMessage {...messages.viewTask} />
                    </Link>
                  </li>
                  <li>
                    <a onClick={() => props.openComments(task.id)}>
                      <FormattedMessage {...messages.viewComments} />
                    </a>
                  </li>
                  <li>
                    <a onClick={() => props.unsaveTask(props.user.id, task.id)}>
                      <FormattedMessage {...messages.unsave} />
                    </a>
                  </li>
                </ul>
              )}
            />
          </div>
        </Fragment>
      );
    }),
  );

  return taskItems.length > 0 ? (
    <div className="mr-links-green-lighter mr-grid mr-grid-columns-12 mr-grid-gap-4 mr-pb-24 mr-justify-between mr-pt-1">
      {taskItems}
    </div>
  ) : (
    <div className="mr-text-grey-lighter">
      <FormattedMessage {...messages.noTasks} />
    </div>
  );
};

registerWidgetType(SavedTasksWidget, descriptor);
