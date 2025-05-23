import classNames from "classnames";
import _isObject from "lodash/isObject";
import _merge from "lodash/merge";
import PropTypes from "prop-types";
import { Component, Fragment } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import AsManageableChallenge from "../../../../interactions/Challenge/AsManageableChallenge";
import AsManager from "../../../../interactions/User/AsManager";
import {
  ChallengeStatus,
  isUsableChallengeStatus,
} from "../../../../services/Challenge/ChallengeStatus/ChallengeStatus";
import ConfirmAction from "../../../ConfirmAction/ConfirmAction";
import messages from "../ChallengeDashboard/Messages";
import RebuildTasksControl from "../RebuildTasksControl/RebuildTasksControl";

const isEmailRequired = (user) => {
  if (window.env.REACT_APP_EMAIL_ENFORCEMENT === "required") {
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
    const staleMonths = Number(window.env.REACT_APP_ARCHIVE_STALE_TIME_IN_MONTHS) || 6;
    const staleDate = today.setMonth(today.getMonth() - staleMonths);

    return lastRefreshDate < staleDate;
  }

  return false;
};

export default class ChallengeControls extends Component {
  deleteChallenge = (parent) => {
    this.props.deleteChallenge(parent.id, this.props.challenge.id);
  };

  refresh = () => {
    this.props.history.push(this.props.location.pathname);
  };

  archiveChallenge = (parent) => {
    this.props.archiveChallenge(parent.id, this.props.challenge.id, this.props.location.pathname);
  };

  unarchiveChallenge = (parent) => {
    this.props.unarchiveChallenge(parent.id, this.props.challenge.id, this.props.location.pathname);
  };

  render() {
    if (!this.props.challenge) {
      return null;
    }

    let parent = null;
    if (_isObject(this.props.challenge.parent)) {
      parent = this.props.challenge.parent;
    } else if (
      Number.isFinite(this.props.challenge.parent) &&
      this.props.challenge.parent === this.props.project?.id
    ) {
      parent = this.props.project;
    }

    const inVirtualProject = this.props.project?.isVirtual ?? false;
    const manager = AsManager(this.props.user);
    const projectId = this.props.challenge?.parent?.id ?? this.props.challenge.parent;
    const status = this.props.challenge?.status ?? ChallengeStatus.none;
    const hasTasks = (this.props.challenge?.actions?.total ?? 0) > 0;
    const isArchived = this.props.challenge?.isArchived;
    const requiresEmail = isEmailRequired(this.props.user);
    const tasksNeedRebuild = handleTasksNeedRebuild(this.props.challenge?.lastTaskRefresh);
    const disableUnarchive = tasksNeedRebuild && this.props.challenge?.systemArchivedAt;

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
            text={`${window.env.REACT_APP_URL}/browse/challenges/${this.props.challenge.id}`}
            onCopy={this.props.onControlComplete}
          >
            <div
              className={classNames(
                this.props.controlClassName,
                "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer",
              )}
            >
              <FormattedMessage {...messages.copyChallengeURLLabel} />
            </div>
          </CopyToClipboard>
        )}
        {!inVirtualProject && manager.canWriteProject(parent) && (
          <Fragment>
            <Link
              to={{
                pathname:
                  `/admin/project/${projectId}/` + `challenge/${this.props.challenge.id}/edit`,
                state: _merge(this.props.searchCriteria?.filters),
              }}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.editChallengeLabel} />
            </Link>

            {manager.canAdministrateProject(parent) && (
              <a
                onClick={() => this.props.onPickProject && this.props.onPickProject()}
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
                  `/admin/project/${projectId}/` + `challenge/${this.props.challenge.id}/clone`,
                state: _merge(this.props.searchCriteria?.filters),
              }}
              className={this.props.controlClassName}
            >
              <FormattedMessage {...messages.cloneChallengeLabel} />
            </Link>

            {manager.canAdministrateProject(parent) && (
              <ConfirmAction
                title={this.props.intl.formatMessage(messages.deleteChallengeConfirm)}
                prompt={
                  <Fragment>
                    <div className="mr-text-mango mr-mb-6 mr-text-lg">
                      {this.props.challenge.name}
                    </div>
                    <div>
                      <FormattedMessage {...messages.deleteChallengeWarn} />
                    </div>
                  </Fragment>
                }
              >
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
                    <a onClick={() => null} style={{ color: "grey", cursor: "default" }}>
                      <FormattedMessage {...messages.unarchiveChallengeLabel} />
                    </a>
                  </>
                ) : (
                  <>
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
          </Fragment>
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
  /** Callback when user wants to pick a project to move to */
  onPickProject: PropTypes.func,
};
