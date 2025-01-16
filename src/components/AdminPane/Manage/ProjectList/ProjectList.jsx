import classNames from "classnames";
import _differenceBy from "lodash/differenceBy";
import _filter from "lodash/filter";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component } from "react";
import PageResultsButton from "../../../LoadMoreButton/PageResultsButton";
import ProjectCard from "../ProjectCard/ProjectCard";
import "./ProjectList.scss";

/**
 * ProjectList renders the given list of projects. It supports an expanded view
 * with projects rendered as cards (the default), a compact view with projects
 * rendered as a list, and a mixed view with pinned projects rendered as cards
 * and the remaining projects rendered as a list.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProjectList extends Component {
  asCard = (project, isPinned) => (
    <ProjectCard
      {...this.props}
      key={project.id}
      project={project}
      loadingChallenges={this.props.loadingChallenges}
      isExpanded={this.props.expandedView || (this.props.mixedView && isPinned)}
      isPinned={isPinned}
    />
  );

  render() {
    // Show pinned projects first
    const pinnedProjects = _filter(
      this.props.projects,
      (project) => this.props.pinnedProjects.indexOf(project.id) !== -1,
    );
    const unpinnedProjects = _differenceBy(this.props.projects, pinnedProjects, "id");

    const pinnedCards = _map(pinnedProjects, (project) => this.asCard(project, true));
    const unpinnedCards = _map(unpinnedProjects, (project) => this.asCard(project, false));

    // For mixed view we display pinned as cards and then others as list
    if (this.props.mixedView) {
      return (
        <div className="mr-pb-24">
          <div className="mr-flex mr-flex-wrap">{pinnedCards}</div>

          <div className="mr-text-green-lighter">
            {unpinnedCards}

            <div className="mr-mt-4 mr-flex mr-justify-center">
              <PageResultsButton {...this.props} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={classNames({ "mr-flex mr-flex-wrap": this.props.expandedView })}>
          {pinnedCards.concat(unpinnedCards)}

          <div className="mr-mt-4 mr-flex mr-justify-center">
            <PageResultsButton {...this.props} className="mr-button mr-button--green-lighter" />
          </div>
        </div>
      );
    }
  }
}

ProjectList.propTypes = {
  /** The projects to consider for display */
  projects: PropTypes.array,
  /** Set to true if challenges are still loading */
  loadingChallenges: PropTypes.bool,
  /** Set to true to show projects as cards instead of list */
  expandedView: PropTypes.bool,
  /** Set to true to show pinned projects as cards and others as list */
  mixedView: PropTypes.bool,
};

ProjectList.defaultProps = {
  projects: [],
  loadingChallenges: false,
  expandedView: true,
  mixedView: false,
};
