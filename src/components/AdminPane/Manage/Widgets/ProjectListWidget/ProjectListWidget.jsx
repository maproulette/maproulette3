import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { extendedFind } from "../../../../../services/Challenge/Challenge";
import { fetchManageableProjects, searchProjects } from "../../../../../services/Project/Project";
import { WidgetDataTarget, registerWidgetType } from "../../../../../services/Widget/Widget";
import WithPagedProjects from "../../../../HOCs/WithPagedProjects/WithPagedProjects";
import WithSearch from "../../../../HOCs/WithSearch/WithSearch";
import WithSearchResults from "../../../../HOCs/WithSearchResults/WithSearchResults";
import MenuControl from "../../../../QuickWidget/MenuControl";
import QuickWidget from "../../../../QuickWidget/QuickWidget";
import SearchBox from "../../../../SearchBox/SearchBox";
import SvgSymbol from "../../../../SvgSymbol/SvgSymbol";
import WithChallengeResultParents from "../../../HOCs/WithChallengeResultParents/WithChallengeResultParents";
import WithComboSearch from "../../../HOCs/WithComboSearch/WithComboSearch";
import ProjectList from "../../ProjectList/ProjectList";
import messages from "./Messages";

const descriptor = {
  widgetKey: "ProjectListWidget",
  label: messages.label,
  targets: [WidgetDataTarget.projects],
  defaultWidth: 12,
  minWidth: 4,
  defaultHeight: 15,
  minHeight: 11,
  defaultConfiguration: {
    view: "card",
    sortBy: ["name"],
  },
};

// Setup child components with needed HOCs.
const ProjectAndChallengeSearch = WithComboSearch(SearchBox, {
  adminProjects: (queryCriteria) => {
    // If no query is present then we don't need to search
    if (!queryCriteria.query) {
      return null;
    }
    return searchProjects(
      {
        searchQuery: queryCriteria.query,
        page: queryCriteria?.page?.currentPage,
        onlyEnabled: false,
      },
      queryCriteria?.page?.resultsPerPage,
    );
  },
  adminChallenges: (queryCriteria) => {
    // If no query is present then we don't need to search
    if (!queryCriteria.query) {
      return null;
    }
    return extendedFind(
      {
        searchQuery: queryCriteria.query,
        page: queryCriteria?.page?.currentPage,
        onlyEnabled: false,
      },
      queryCriteria?.page?.resultsPerPage,
    );
  },
});

export default class ProjectListWidget extends Component {
  setView = (view) => {
    if (this.props.widgetConfiguration.view !== view) {
      this.props.updateWidgetConfiguration({ view });
    }
  };

  viewControl = (view, icon) => (
    <a onClick={() => this.setView(view)}>
      <SvgSymbol
        sym={icon ? icon : `${view}-icon`}
        viewBox="0 0 20 20"
        className={classNames(
          "mr-h-4 mr-w-4 mr-ml-4",
          this.props.widgetConfiguration.view === view ? "mr-fill-white" : "mr-fill-white-50",
        )}
      />
    </a>
  );

  render() {
    const viewControls = (
      <div>
        <MenuControl>
          {this.viewControl("card", "cards-icon")}
          {this.viewControl("mixed")}
          {this.viewControl("list")}
        </MenuControl>
      </div>
    );

    const searchControl =
      this.props.projects.length === 0 ? null : (
        <ProjectAndChallengeSearch
          placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)}
        />
      );

    return (
      <QuickWidget
        {...this.props}
        className=""
        widgetTitle={<FormattedMessage {...messages.title} />}
        headerControls={<div className="mr-my-2">{searchControl}</div>}
        rightHeaderControls={<div className="mr-my-2">{viewControls}</div>}
      >
        <ProjectList
          {...this.props}
          projects={this.props.pagedProjects}
          expandedView={this.props.widgetConfiguration.view === "card"}
          mixedView={this.props.widgetConfiguration.view === "mixed"}
          showPreview={this.props.adminProjectsSearchActive}
        />
      </QuickWidget>
    );
  }
}

ProjectListWidget.propTypes = {
  widgetConfiguration: PropTypes.object,
  updateWidgetConfiguration: PropTypes.func.isRequired,
  filteredProjects: PropTypes.array,
};

const Widget = WithSearch(
  WithSearchResults(
    // for projects
    WithSearchResults(
      // for challenges
      WithChallengeResultParents(
        WithPagedProjects(injectIntl(ProjectListWidget), "resultProjects", "pagedProjects"),
      ),
      "adminChallenges",
      "challenges",
      "filteredChallenges",
    ),
    "adminProjects",
    "filteredProjects",
    "resultProjects",
  ),
  "adminProjectList",
  (queryCriteria, resultsPerPage, props) => {
    // We only fetch all managed projects if we are not doing a query.
    if (queryCriteria.query) {
      return null;
    }

    const filters = props.currentConfiguration?.filters?.projectFilters ?? {};
    return fetchManageableProjects(
      queryCriteria?.page?.currentPage,
      queryCriteria?.page?.resultsPerPage,
      filters.owner,
      filters.visible,
    );
  },
);

registerWidgetType(Widget, descriptor);
