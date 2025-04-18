import _differenceBy from "lodash/differenceBy";
import _filter from "lodash/filter";
import _find from "lodash/find";
import _isEmpty from "lodash/isEmpty";
import _isObject from "lodash/isObject";
import _omit from "lodash/omit";
import _slice from "lodash/slice";
import _sortBy from "lodash/sortBy";
import PropTypes from "prop-types";
import { Component } from "react";
import { RESULTS_PER_PAGE } from "../../../services/Search/Search";

export default function (
  WrappedComponent,
  projectsProp,
  outputProp,
  pageSearchGroup,
  allowVirtual = true,
) {
  class WithPagedProjects extends Component {
    render() {
      const searchGroups = this.props.adminChallengesSearchActive
        ? ["adminProjects", "adminChallenges"]
        : ["adminProjectList"];
      const pageGroup = pageSearchGroup
        ? pageSearchGroup
        : this.props.adminChallengesSearchActive
          ? "adminProjects"
          : "adminProjectList";

      const currentPage = this.props.currentSearch?.[pageGroup]?.page?.currentPage ?? 0;
      const resultsPerPage =
        this.props.currentSearch?.[pageGroup]?.page?.resultsPerPage ?? RESULTS_PER_PAGE;
      const numberResultsToShow = (currentPage + 1) * resultsPerPage;

      let pagedProjects = this.props[projectsProp];
      if (!allowVirtual) {
        pagedProjects = _filter(pagedProjects, (p) => !p.isVirtual);
      }

      const hasMoreResults = pagedProjects.length > numberResultsToShow || this.props.isLoading;

      // Only sort by display name if we do not have a challenge search going.
      if (!this.props.adminChallengesSearchActive) {
        pagedProjects = _sortBy(pagedProjects, (p) => (p.displayName || p.name).toLowerCase());

        // Grab ths pinnedProjects first so they don't get lost when we chunk.
        let pinnedProjects = _filter(
          pagedProjects,
          (project) => this.props.pinnedProjects.indexOf(project.id) !== -1,
        );

        // Then chunk of everything else.
        pagedProjects = _differenceBy(pagedProjects, pinnedProjects, "id");
        pagedProjects = _slice(pagedProjects, 0, numberResultsToShow);

        // Now we want pinned projects first followed by the rest of the sorted projects
        pagedProjects = pinnedProjects.concat(pagedProjects);
      } else {
        for (const c of this.props.filteredChallenges) {
          const parent = _find(
            pagedProjects,
            (p) => p.id === (_isObject(c.parent) ? c.parent.id : c.parent),
          );
          if (parent && (!parent.score || c.score > parent.score)) {
            parent.score = c.score;
          }
        }

        pagedProjects = _sortBy(pagedProjects, (p) => p.score);
        pagedProjects = _slice(pagedProjects, 0, numberResultsToShow);
      }

      if (_isEmpty(outputProp)) {
        outputProp = projectsProp;
      }

      return (
        <WrappedComponent
          hasMoreResults={hasMoreResults}
          {...{ [outputProp]: pagedProjects }}
          {..._omit(this.props, outputProp)}
          applyToSearchGroups={searchGroups}
          searchPage={{ currentPage, resultsPerPage }}
        />
      );
    }
  }

  WithPagedProjects.propTypes = {
    user: PropTypes.object,
  };

  return WithPagedProjects;
}
