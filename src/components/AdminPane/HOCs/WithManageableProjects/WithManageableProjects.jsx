import _each from "lodash/each";
import _isEqual from "lodash/isEqual";
import _omit from "lodash/omit";
import _values from "lodash/values";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AsManager from "../../../../interactions/User/AsManager";
import { fetchProjectChallengeListing } from "../../../../services/Challenge/Challenge";
import {
  addProjectManager,
  deleteProject,
  fetchManageableProjects,
  fetchProject,
  fetchProjectManagers,
  fetchProjectsById,
  removeProject,
  removeProjectManager,
  saveProject,
  searchProjects,
  setProjectManagerRole,
} from "../../../../services/Project/Project";
import { addChallenge, removeChallenge } from "../../../../services/Project/VirtualProject";
import { RESULTS_PER_PAGE } from "../../../../services/Search/Search";
import { removeTeamFromProject, setTeamProjectRole } from "../../../../services/Team/Team";
import WithCurrentUser from "../../../HOCs/WithCurrentUser/WithCurrentUser";
import WithPinned from "../../HOCs/WithPinned/WithPinned";
import WithTallied from "../../HOCs/WithTallied/WithTallied";

/**
 * WithManageableProjects makes available to the WrappedComponent all the
 * projects the given user has permission to manage.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithManageableProjects = function (WrappedComponent, includeChallenges = false) {
  return class extends Component {
    state = {
      loadingProjects: true,
      loadingChallenges: includeChallenges,
    };

    getProjectFilters(props) {
      return props.currentConfiguration?.filters?.projectFilters ?? {};
    }

    loadProjects() {
      const filters = this.getProjectFilters(this.props);

      this.props
        .fetchManageableProjects(null, RESULTS_PER_PAGE, filters.owner, filters.visible)
        .then(({ result }) => {
          if (includeChallenges) {
            this.props.fetchProjectChallengeListing(result).then(() => {
              this.setState({ loadingChallenges: false });
            });
          }

          // Since we only fetched a small portion of the total projects in the
          // database we need to make sure we also fetch the projects that are pinned.
          let missingProjects = [];
          _each(this.props.pinnedProjects, (pinnedProject) => {
            if (!this.props.entities.projects[pinnedProject]) {
              missingProjects.push(pinnedProject);
            }
          });
          if (missingProjects.length > 0) {
            this.props.fetchProjectsById(missingProjects);

            if (includeChallenges) {
              this.props.fetchProjectChallengeListing(missingProjects).then(() => {
                this.setState({ loadingChallenges: false });
              });
            }
          }

          this.setState({ loadingProjects: false });
        })
        .catch((error) => {
          // Handle any errors that occurred during project loading
          console.error("Error loading projects:", error);
          this.setState({ loadingProjects: false });
        });
    }

    componentDidMount() {
      this.loadProjects();
    }

    componentDidUpdate(prevProps) {
      if (!_isEqual(this.getProjectFilters(this.props), this.getProjectFilters(prevProps))) {
        this.loadProjects();
      }
    }

    render() {
      const manager = AsManager(this.props.user);

      const manageableProjects = manager.manageableProjects(_values(this.props.entities?.projects));

      let manageableChallenges = [];
      if (includeChallenges) {
        manageableChallenges = manager.manageableChallenges(
          manageableProjects,
          _values(this.props.entities?.challenges),
        );
      }

      return (
        <WrappedComponent
          {..._omit(this.props, ["entities", "fetchManageableProjects"])}
          projects={manageableProjects}
          managesSingleProject={manageableProjects.length === 1}
          challenges={manageableChallenges}
          loadingProjects={this.state.loadingProjects}
          loadingChallenges={this.state.loadingChallenges}
        />
      );
    }
  };
};

const mapStateToProps = (state) => ({
  entities: state.entities,
});

const mapDispatchToProps = (dispatch, ownProps) => {
  const actions = bindActionCreators(
    {
      fetchManageableProjects,
      fetchProject,
      fetchProjectsById,
      fetchProjectChallengeListing,
      searchProjects,
      saveProject,
      addProjectManager,
      setTeamProjectRole,
      fetchProjectManagers,
      setProjectManagerRole,
      removeProjectManager,
      removeTeamFromProject,
      addChallenge,
      removeChallenge,
    },
    dispatch,
  );

  actions.deleteProject = (projectId, immediate = false) => {
    // Optimistically remove the project.
    dispatch(removeProject(projectId));
    return dispatch(deleteProject(projectId, immediate));
  };

  actions.toggleProjectEnabled = (project) => {
    const updatedProject = Object.assign({}, project, { enabled: !project.enabled });
    return dispatch(saveProject(updatedProject, ownProps.user));
  };

  return actions;
};

export default (WrappedComponent, includeChallenges) =>
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(
    WithCurrentUser(
      WithPinned(WithTallied(WithManageableProjects(WrappedComponent, includeChallenges))),
    ),
  );
