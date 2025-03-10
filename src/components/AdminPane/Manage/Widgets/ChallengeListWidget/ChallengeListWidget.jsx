import classNames from "classnames";
import _difference from "lodash/difference";
import _isEmpty from "lodash/isEmpty";
import _join from "lodash/join";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { extendedFind } from "../../../../../services/Challenge/Challenge";
import { buildLinkToMapperExportCSV } from "../../../../../services/Task/TaskReview/TaskReview";
import { WidgetDataTarget, registerWidgetType } from "../../../../../services/Widget/Widget";
import ConfirmAction from "../../../../ConfirmAction/ConfirmAction";
import Dropdown from "../../../../Dropdown/Dropdown";
import External from "../../../../External/External";
import WithSearch from "../../../../HOCs/WithSearch/WithSearch";
import WithSearchResults from "../../../../HOCs/WithSearchResults/WithSearchResults";
import QuickWidget from "../../../../QuickWidget/QuickWidget";
import SearchBox from "../../../../SearchBox/SearchBox";
import SvgSymbol from "../../../../SvgSymbol/SvgSymbol";
import TimezonePicker from "../../../../TimezonePicker/TimezonePicker";
import { DEFAULT_TIMEZONE_OFFSET } from "../../../../TimezonePicker/TimezonePicker";
import ChallengeList from "../../ChallengeList/ChallengeList";
import ProjectPickerModal from "../../ProjectPickerModal/ProjectPickerModal";
import messages from "./Messages";

const descriptor = {
  widgetKey: "ChallengeListWidget",
  label: messages.label,
  targets: [WidgetDataTarget.challenges],
  minWidth: 3,
  defaultWidth: 12,
  defaultHeight: 15,
  defaultConfiguration: {
    view: "list",
    sortBy: ["name"],
    timezoneOffset: DEFAULT_TIMEZONE_OFFSET,
  },
};

// Setup child components with needed HOCs.
class ChallengeSearchBox extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.searchQuery?.query !== prevProps?.searchQuery?.query) {
      if (!this.props.searchQuery?.query) {
        this.props.toggleSearchTallies(this.props.projectId);
      } else if (!prevProps?.searchQuery?.query) {
        this.props.toggleSearchTallies(
          this.props.projectId,
          _map(this.props.challenges, (c) => c.id),
        );
      }
    }
  }

  render() {
    return <SearchBox {...this.props} />;
  }
}

const ChallengeSearch = WithSearch(ChallengeSearchBox, "challengeListWidget", (searchCriteria) =>
  extendedFind({ searchQuery: searchCriteria.query, onlyEnabled: false }, 1000),
);

export default class ChallengeListWidget extends Component {
  state = {
    pickingProject: false,
    deletingChallenges: false,
  };

  componentDidUpdate() {
    if (this.props.challenges && !this.props.talliedChallenges(this.props.project.id)) {
      this.props.updateTallyMarks(
        this.props.project.id,
        _map(this.props.challenges, (c) => c.id),
      );
    }
  }

  projectPickerCanceled = () => {
    this.setState({ pickingProject: false });
  };

  moveToProject = (project, tallied) => {
    this.setState({ pickingProject: false });
    this.props.moveChallenges(tallied, project.id, this.props.clearTallies);
  };

  deleteChallenges = (tallied) => {
    this.setState({ deletingChallenges: true });
    this.props.deleteChallenges(tallied, () => {
      this.props.clearTallies();
      this.setState({ deletingChallenges: false });
    });
  };

  setTimezone = (timezoneOffset) => {
    if (this.props.widgetConfiguration.timezoneOffset !== timezoneOffset) {
      this.props.updateWidgetConfiguration({ timezoneOffset });
    }
  };

  toggleAllTallies = () => {
    if (
      (this.props.talliedChallenges(this.props.project.id) || []).length ===
      (this.props.challenges || []).length
    ) {
      this.props.updateTallyMarks(this.props.project.id, []);
    } else {
      this.props.updateTallyMarks(
        this.props.project.id,
        _map(this.props.challenges, (c) => c.id),
      );
    }
  };

  renderSelectCommands = (tallied) => {
    const archivedOn = this.props.dashboardChallengeFilters.archived;

    const bulkArchive = () => {
      this.props.bulkArchive(tallied, !archivedOn, this.props.clearTallies);
    };

    return (
      <>
        <li>
          <Link
            to={`/admin/project/${this.props.project.id}/challenges/edit`}
            className={classNames(
              this.props.controlClassName,
              "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer",
            )}
          >
            <FormattedMessage {...messages.editSelected} />
          </Link>
        </li>
        <li>
          <div
            className={classNames(
              this.props.controlClassName,
              "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer",
            )}
            onClick={() => this.setState({ pickingProject: true })}
          >
            <FormattedMessage {...messages.moveSelected} />
          </div>
        </li>
        <li>
          <div
            className={classNames(
              this.props.controlClassName,
              "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer",
            )}
            onClick={bulkArchive}
          >
            {archivedOn ? (
              <FormattedMessage {...messages.unarchiveSelected} />
            ) : (
              <FormattedMessage {...messages.archiveSelected} />
            )}
          </div>
        </li>
        <li>
          <ConfirmAction>
            <div
              className={classNames(
                this.props.controlClassName,
                "mr-text-green-lighter hover:mr-text-white mr-cursor-pointer",
              )}
              onClick={() => this.deleteChallenges(tallied)}
            >
              <FormattedMessage {...messages.deleteSelected} />
            </div>
          </ConfirmAction>
        </li>
      </>
    );
  };

  render() {
    const tallied = this.props.talliedChallenges(this.props.project.id) || [];
    const allEnabled =
      _difference(
        _map(this.props.challenges, (c) => c.id),
        tallied,
      ).length === 0;
    const someEnabled = tallied.length !== 0;

    const selectedChallengeIds = _join(this.props.talliedChallenges(this.props.project.id), ",");

    // project export CSV needs 'cId' (with capital I)
    const cId = _isEmpty(selectedChallengeIds) ? "" : `cId=${selectedChallengeIds}`;

    // export mapper review CSV needs 'cid'
    const cIdReview = _isEmpty(selectedChallengeIds) ? "" : `cid=${selectedChallengeIds}`;
    const pIdReview = _isEmpty(selectedChallengeIds) ? `pid=${this.props.project.id}` : "";

    const rightHeaderControls =
      this.props.projects.length === 0 ? null : (
        <div className="mr-flex mr-justify-end mr-items-center">
          <button className="mr-ml-4" onClick={this.toggleAllTallies}>
            <SvgSymbol
              className={classNames("mr-w-4 mr-h-4", {
                "mr-fill-mango": allEnabled,
                "mr-fill-mango-60": someEnabled && !allEnabled,
                "mr-fill-mango-30": !someEnabled && !allEnabled,
              })}
              viewBox="0 0 20 20"
              sym="chart-icon"
            />
          </button>
          <div className="mr-pt-2 mr-pl-4">
            <Dropdown
              className="mr-dropdown--right"
              dropdownButton={(dropdown) => (
                <button
                  onClick={dropdown.toggleDropdownVisible}
                  className="mr-flex mr-items-center mr-text-green-lighter"
                >
                  <SvgSymbol
                    sym="cog-icon"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-5 mr-h-5"
                  />
                </button>
              )}
              dropdownContent={() => (
                <ul className="mr-list-dropdown">
                  {someEnabled && this.renderSelectCommands(tallied)}
                  <li className="mr-text-md mr-mb-2 mr-text-yellow">
                    <FormattedMessage {...messages.exportTitle} />
                  </li>
                  <li className="mr-mb-2">
                    <span className="mr-pr-1 mr-pb-2 mr-text-orange mr-text-sm">
                      <FormattedMessage {...messages.timezoneLabel} />
                    </span>
                    <TimezonePicker
                      changeTimezone={this.setTimezone}
                      currentTimezone={this.props.widgetConfiguration.timezoneOffset}
                    />
                  </li>
                  <li>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={
                        `${window.env.REACT_APP_MAP_ROULETTE_SERVER_URL}` +
                        `/api/v2/project/${this.props.project?.id}` +
                        `/tasks/extract?${cId}&timezone=` +
                        `${encodeURIComponent(
                          this.props.widgetConfiguration?.timezoneOffset ?? "",
                        )}`
                      }
                      className="mr-flex mr-items-center"
                    >
                      <SvgSymbol
                        className="mr-w-4 mr-h-4 mr-fill-current mr-mr-2"
                        viewBox="0 0 20 20"
                        sym="download-icon"
                      />
                      <FormattedMessage {...messages.exportCSVLabel} />
                    </a>
                  </li>
                  <li className="mr-mt-2">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${buildLinkToMapperExportCSV(this.props.criteria)}&${cIdReview}${pIdReview}`}
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
                </ul>
              )}
            />
          </div>
        </div>
      );

    const searchControl = (
      <ChallengeSearch
        toggleSearchTallies={this.props.toggleSearchTallies}
        challenges={this.props.challenges}
        projectId={this.props.project.id}
        placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)}
      />
    );

    return (
      <>
        <QuickWidget
          {...this.props}
          className=""
          widgetTitle={<FormattedMessage {...messages.title} />}
          headerControls={<div className="mr-my-2">{searchControl}</div>}
          rightHeaderControls={<div className="mr-my-2">{rightHeaderControls}</div>}
        >
          <div className="mr-pb-32">
            <ChallengeList
              {...this.props}
              challenges={this.props.challenges}
              suppressControls
              loadingChallenges={this.state.deletingChallenges || this.props.loadingChallenges}
            />
          </div>
        </QuickWidget>
        {this.state.pickingProject && (
          <External>
            <ProjectPickerModal
              {...this.props}
              currentProjectId={this.props.project.id}
              onCancel={this.projectPickerCanceled}
              onSelectProject={(project) => this.moveToProject(project, tallied)}
            />
          </External>
        )}
      </>
    );
  }
}

ChallengeListWidget.propTypes = {
  widgetConfiguration: PropTypes.object,
  updateWidgetConfiguration: PropTypes.func.isRequired,
};

const Widget = WithSearchResults(
  injectIntl(ChallengeListWidget),
  "challengeListWidget",
  "challenges",
  "challenges",
);

registerWidgetType(Widget, descriptor);
