import React, { Component } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, injectIntl } from "react-intl";
import _get from "lodash/get";
import { Link } from "react-router-dom";
import classNames from "classnames";
import AsManager from "../../../../interactions/User/AsManager";
import AsManageableProject from "../../../../interactions/Project/AsManageableProject";
import Dropdown from "../../../Dropdown/Dropdown";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import BusySpinner from "../../../BusySpinner/BusySpinner";
import ChallengeList from "../ChallengeList/ChallengeList";
import { buildLinkToMapperExportCSV } from "../../../../services/Task/TaskReview/TaskReview";
import WithProjectManagement from "../../HOCs/WithProjectManagement/WithProjectManagement";
import messages from "./Messages";

export class ProjectCard extends Component {
  archiveProject = () => {
    this.props.archiveProject(this.props.project.id);
  };

  unarchiveProject = () => {
    this.props.unarchiveProject(this.props.project.id);
  };

  render() {
    if (!this.props.project) {
      return null;
    }

    const manager = AsManager(this.props.user);
    const project = AsManageableProject(this.props.project);
    const isArchived = _get(project, "isArchived");

    let projectBody = null;
    if (this.props.showPreview) {
      const matchingChallenges = project.childChallenges(
        this.props.filteredChallenges
      );
      projectBody =
        matchingChallenges.length === 0 ? null : (
          <div className="mr-pr-4">
            <div className="mr-uppercase mr-mt-2 mr-mb-4 mr-ml-4 mr-text-grey-light">
              <FormattedMessage {...messages.challengePreviewHeader} />
            </div>

            <div className="mr-ml-8">
              <ChallengeList
                {...this.props}
                challenges={matchingChallenges}
                suppressControls
                hideTallyControl
              />
            </div>
          </div>
        );
    } else if (this.props.isExpanded) {
      projectBody = (
        <div className="mr-border-t mr-border-white-15 mr-mt-6 mr-pt-4 mr-px-4 mr-overflow-y-auto mr-max-h-100">
          <div className="mr-uppercase mr-text-grey-light mr-mb-4">
            <FormattedMessage {...messages.challengesTabLabel} />
          </div>
          <ChallengeList
            {...this.props}
            challenges={project.childChallenges(this.props.challenges)}
            suppressControls={!manager.canWriteProject(project)}
            hideTallyControl
          />
        </div>
      );
    }

    const menuOptions = (
      <div
        className={classNames(
          "mr-flex mr-justify-end mr-text-xxs mr-leading-0 mr-flex-grow-0",
          { "mr-pr-2 mr-pt-2": this.props.isExpanded }
        )}
      >
        <Dropdown
          className="mr-dropdown--right"
          dropdownButton={(dropdown) => (
            <button
              onClick={dropdown.toggleDropdownVisible}
              className="mr-flex mr-items-center mr-text-white"
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
              {manager.canWriteProject(project) && (
                <li>
                  <Link to={`/admin/project/${project.id}/edit`}>
                    <FormattedMessage {...messages.editProjectLabel} />
                  </Link>
                </li>
              )}
              <li>
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a onClick={() => this.props.toggleProjectPin(project.id)}>
                  <FormattedMessage
                    {...(this.props.isPinned
                      ? messages.unpinProjectLabel
                      : messages.pinProjectLabel)}
                  />
                </a>
              </li>
              {manager.canWriteProject(this.props.project) && (
                <li>
                  {this.props.project.isVirtual ? (
                    <Link
                      to={`/admin/virtual/project/${this.props.project.id}/challenges/manage`}
                    >
                      <FormattedMessage
                        {...messages.manageChallengeListLabel}
                      />
                    </Link>
                  ) : (
                    <Link
                      to={`/admin/project/${this.props.project.id}/challenges/new`}
                    >
                      <FormattedMessage {...messages.addChallengeLabel} />
                    </Link>
                  )}
                </li>
              )}
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${process.env.REACT_APP_MAP_ROULETTE_SERVER_URL}/api/v2/project/${this.props.project.id}/tasks/extract`}
                  className="mr-flex mr-items-center"
                >
                  <SvgSymbol
                    sym="download-icon"
                    viewBox="0 0 20 20"
                    className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                  />
                  <FormattedMessage {...messages.exportCSVLabel} />
                </a>
              </li>
              <li className="mr-mt-2">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`${buildLinkToMapperExportCSV(
                    this.props.criteria
                  )}&pid=${this.props.project.id}`}
                  className="mr-flex mr-items-center"
                >
                  <SvgSymbol
                    sym="download-icon"
                    viewBox="0 0 20 20"
                    className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                  />
                  <FormattedMessage {...messages.exportMapperReviewCSVLabel} />
                </a>
              </li>
              {manager.canWriteProject(this.props.project) &&
              !this.props.project.isVirtual &&
              !isArchived ? (
                <li>
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a
                    onClick={this.archiveProject}
                    className={this.props.controlClassName}
                  >
                    <FormattedMessage {...messages.archiveProjectLabel} />
                  </a>
                </li>
              ) : null}
              {manager.canWriteProject(this.props.project) &&
              !this.props.project.isVirtual &&
              isArchived ? (
                <li>
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a
                    onClick={this.unarchiveProject}
                    className={this.props.controlClassName}
                  >
                    <FormattedMessage {...messages.unarchiveProjectLabel} />
                  </a>
                </li>
              ) : null}
            </ul>
          )}
        />
      </div>
    );

    return (
      <div
        className={classNames(
          "mr-mb-2",
          this.props.isExpanded
            ? "mr-bg-black-15 mr-w-96 mr-mr-4 mr-pb-6 mr-mb-6 mr-rounded"
            : "mr-py-2"
        )}
      >
        {this.props.isExpanded && menuOptions}
        <div
          className={classNames(
            "mr-flex mr-justify-between mr-px-4",
            this.props.isExpanded
              ? "mr-items-start mr-h-14 mr-overflow-y-auto"
              : "mr-items-center"
          )}
        >
          <div className="mr-flex-grow-0 mr-flex mr-items-start">
            <div
              className="mr-pt-2-shy"
              title={
                project.enabled
                  ? this.props.intl.formatMessage(messages.enabledTooltip)
                  : this.props.intl.formatMessage(messages.disabledTooltip)
              }
            >
              <span className="mr-text-white">
                <SvgSymbol
                  className="mr-fill-current mr-h-5 mr-align-middle mr-cursor-pointer"
                  viewBox="0 0 20 20"
                  sym={project.enabled ? "visible-icon" : "hidden-icon"}
                />
              </span>
            </div>

            <div className="mr-flex mr-items-center mr-links-green-lighter mr-text-lg mr-mx-4">
              <Link to={`/admin/project/${project.id}`}>
                {project.displayName || project.name}
                {project.isVirtual ? (
                  <span className="mr-mx-4 mr-text-pink mr-text-sm">
                    <FormattedMessage {...messages.virtualHeader} />
                  </span>
                ) : null}
              </Link>
              {this.props.isExpanded && this.props.loadingChallenges && (
                <BusySpinner inline />
              )}
            </div>
          </div>

          {!this.props.isExpanded && (
            <div className="mr-flex-grow mr-border-b mr-border-white-15 mr-mr-4" />
          )}

          {!this.props.isExpanded && menuOptions}
        </div>

        {projectBody}
      </div>
    );
  }
}

ProjectCard.propTypes = {
  user: PropTypes.object.isRequired,
  project: PropTypes.object,
  isExpanded: PropTypes.bool,
  showPreview: PropTypes.bool,
  loadingChallenges: PropTypes.bool,
  challenges: PropTypes.array,
  filteredChallenges: PropTypes.array,
};

ProjectCard.defaultProps = {
  isExpanded: false,
  showPreview: false,
  loadingChallenges: false,
};

export default WithProjectManagement(injectIntl(ProjectCard));
