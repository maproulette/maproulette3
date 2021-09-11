import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import _get from "lodash/get";
import _isObject from "lodash/isObject";
import _isFinite from "lodash/isFinite";
import _merge from "lodash/merge";
import AsManager from "../../../../interactions/User/AsManager";
import AsManageableChallenge from "../../../../interactions/Challenge/AsManageableChallenge";
import {
  ChallengeStatus,
  isUsableChallengeStatus,
} from "../../../../services/Challenge/ChallengeStatus/ChallengeStatus";
import RebuildTasksControl from "../RebuildTasksControl/RebuildTasksControl";
import ProjectPickerModal from "../ProjectPickerModal/ProjectPickerModal";
import ConfirmAction from "../../../ConfirmAction/ConfirmAction";
import messages from "../ChallengeDashboard/Messages";

const isEmailRequired = (user) => {
  if (process.env.REACT_APP_EMAIL_ENFORCEMENT === "required") {
    if (!user?.settings?.email) {
      return true;
    }
  }

  return false;
};

const handleTasksNeedRebuild = (dateString) => {
  if (dateString) {
    const lastRefreshDate = new Date(dateString);
    const today = new Date();
    const sixMonthsAgo = today.setMonth(today.getMonth() - 6);

    return lastRefreshDate < sixMonthsAgo;
  }

  return false;
};

export default class ChallengeControls extends Component {
  state = {
    pickingProject: false,
  };

  projectPickerCanceled = () => {
    this.setState({ pickingProject: false });
    this.props.onControlComplete && this.props.onControlComplete();
  };

  moveToProject = (project) => {
    this.setState({ pickingProject: false });
    this.props.moveChallenge(this.props.challenge.id, project.id);
    this.props.onControlComplete && this.props.onControlComplete();
  };

  deleteChallenge = (parent) => {
    this.props.deleteChallenge(parent.id, this.props.challenge.id);
  };

  refresh = () => {
    this.props.history.push(this.props.location.pathname);
  };

  archiveChallenge = (parent) => {
    this.props.archiveChallenge(
      parent.id,
      this.props.challenge.id,
      this.props.location.pathname
    );
  };

  unarchiveChallenge = (parent) => {
    this.props.unarchiveChallenge(
      parent.id,
      this.props.challenge.id,
      this.props.location.pathname
    );
  };

  render() {
    if (!this.props.challenge) {
      return null;
    }

    let parent = null;
    if (_isObject(this.props.challenge.parent)) {
      parent = this.props.challenge.parent;
    } else if (
      _isFinite(this.props.challenge.parent) &&
      this.props.challenge.parent === _get(this.props, "project.id")
    ) {
      parent = this.props.project;
    }

    const inVirtualProject = _get(this.props, "project.isVirtual", false);
    const manager = AsManager(this.props.user);
    const projectId = _get(
      this.props.challenge,
      "parent.id",
      this.props.challenge.parent
    );
    const status = _get(this.props.challenge, "status", ChallengeStatus.none);
    const hasTasks = _get(this.props.challenge, "actions.total", 0) > 0;
    const isArchived = _get(this.props.challenge, "isArchived");
    const requiresEmail = isEmailRequired(this.props.user);
    const tasksNeedRebuild = handleTasksNeedRebuild(
      _get(this.props.challenge, "lastTaskRefresh")
    );
    const disableUnarchive =
      tasksNeedRebuild && _get(this.props.challenge, "systemArchivedAt");

    if (requiresEmail) {
      return (
        <div className="mr-text-red-light">
          Challenge controls are disabled until an email is provided.
        </div>
      );
    }

    return (
      <div className={this.props.className}>
        {hasTasks &&
          isUsableChallengeStatus(status, true) &&
          status !== ChallengeStatus.finished && (
            <Link
              to={`/challenge/${this.props.challenge.id}`}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.startChallengeLabel} />
            </Link>
          )}
        {this.props.includeCopyURL && (
          <CopyToClipboard
            text={`${process.env.REACT_APP_URL}/browse/challenges/${this.props.challenge.id}`}
            onCopy={this.props.onControlComplete}
          >
            <div
              className={classNames(
                this.props.controlClassName,
                "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer"
              )}
            >
              <FormattedMessage {...messages.copyChallengeURLLabel} />
            </div>
          </CopyToClipboard>
        )}
        {!inVirtualProject && manager.canWriteProject(parent) && (
          <React.Fragment>
            <Link
              to={{
                pathname:
                  `/admin/project/${projectId}/` +
                  `challenge/${this.props.challenge.id}/edit`,
                state: _get(this.props.searchCriteria, "filters"),
              }}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.editChallengeLabel} />
            </Link>

            {manager.canAdministrateProject(parent) && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                onClick={() => this.setState({ pickingProject: true })}
                className={this.props.controlClassName}
              >
                <FormattedMessage {...messages.moveChallengeLabel} />
              </a>
            )}

            {this.props.onChallengeDashboard &&
              AsManageableChallenge(this.props.challenge).isRebuildable() && (
                <RebuildTasksControl {...this.props} />
              )}

            <Link
              to={{
                pathname:
                  `/admin/project/${projectId}/` +
                  `challenge/${this.props.challenge.id}/clone`,
                state: _merge(
                  { cloneChallenge: true },
                  _get(this.props.searchCriteria, "filters")
                ),
              }}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.cloneChallengeLabel} />
            </Link>

            {manager.canAdministrateProject(parent) && (
              <ConfirmAction
                title={this.props.intl.formatMessage(
                  messages.deleteChallengeConfirm
                )}
                prompt={
                  <React.Fragment>
                    <div className="mr-text-mango mr-mb-6 mr-text-lg">
                      {this.props.challenge.name}
                    </div>
                    <div>
                      <FormattedMessage {...messages.deleteChallengeWarn} />
                    </div>
                  </React.Fragment>
                }
              >
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  onClick={() => this.deleteChallenge(parent)}
                  className={this.props.controlClassName}
                >
                  <FormattedMessage {...messages.deleteChallengeLabel} />
                </a>
              </ConfirmAction>
            )}
            {manager.canAdministrateProject(parent) && !isArchived ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  onClick={() => this.archiveChallenge(parent)}
                  className={this.props.controlClassName}
                >
                  <FormattedMessage {...messages.archiveChallengeLabel} />
                </a>
              </>
            ) : null}
            {manager.canAdministrateProject(parent) && isArchived ? (
              <>
                {disableUnarchive ? (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                      onClick={() => null}
                      style={{ color: "grey", cursor: "default" }}
                    >
                      <FormattedMessage {...messages.unarchiveChallengeLabel} />
                    </a>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a
                      onClick={() => this.unarchiveChallenge(parent)}
                      className={this.props.controlClassName}
                    >
                      <FormattedMessage {...messages.unarchiveChallengeLabel} />
                    </a>
                  </>
                )}
              </>
            ) : null}
            {this.state.pickingProject && (
              <ProjectPickerModal
                {...this.props}
                currentProjectId={projectId}
                onCancel={this.projectPickerCanceled}
                onSelectProject={this.moveToProject}
              />
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

ChallengeControls.propTypes = {
  /** The current challenge to view */
  challenge: PropTypes.object,
  /** Invoked when the user wishes to delete the challenge */
  deleteChallenge: PropTypes.func.isRequired,
  /** Invoked when the user wishes to archive the challenge */
  archiveChallenge: PropTypes.func.isRequired,
  /** Invoked when the user wishes to move the challenge */
  moveChallenge: PropTypes.func.isRequired,
  /** Invoked when an in-situ control is completed */
  onControlComplete: PropTypes.func,
  /** Some controls are only available from the challenge dashboard */
  onChallengeDashboard: PropTypes.bool,
};
