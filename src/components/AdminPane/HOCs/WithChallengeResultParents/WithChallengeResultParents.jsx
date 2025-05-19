import _filter from "lodash/filter";
import _uniqBy from "lodash/uniqBy";
import { Component } from "react";

/**
 * WithChallengeResultParents ensures that parent projects of the given result
 * challenges are included in the result projects passed down to the
 * WrappedComponent.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithChallengeResultParents = function (WrappedComponent) {
  return class extends Component {
    projectsAndChallengeParents = () => {
      if ((this.props.filteredChallenges?.length ?? 0) === 0) {
        return this.props.resultProjects;
      }

      // If there are pre-filtered projects, use those
      const allProjects = Array.isArray(this.props.filteredProjects)
        ? this.props.filteredProjects
        : this.props.projects;

      const projectsWithChallengeSearchResults = new Set();

      for (const c of this.props.filteredChallenges) {
        projectsWithChallengeSearchResults.add(c.parent);

        if (c.virtualParents) {
          for (const vp of c.virtualParents) {
            projectsWithChallengeSearchResults.add(vp);
          }
        }
      }

      // Include both project results and projects that have challenge results.
      return _uniqBy(
        this.props.resultProjects.concat(
          _filter(allProjects, (project) => projectsWithChallengeSearchResults.has(project.id)),
        ),
        "id",
      );
    };

    render() {
      return (
        <WrappedComponent {...this.props} resultProjects={this.projectsAndChallengeParents()} />
      );
    }
  };
};

export default (WrappedComponent) => WithChallengeResultParents(WrappedComponent);
