import _filter from "lodash/filter";
import _find from "lodash/find";
import _isObject from "lodash/isObject";
import _map from "lodash/map";
import _omit from "lodash/omit";
import _sortBy from "lodash/sortBy";
import _values from "lodash/values";
import { denormalize } from "normalizr";
import { Component } from "react";
import { connect } from "react-redux";
import AsManager from "../../../../interactions/User/AsManager";
import {
  challengeDenormalizationSchema,
  fetchLatestProjectChallengeActivity,
  fetchProjectChallengeActions,
  fetchProjectChallengeComments,
  fetchProjectChallenges,
} from "../../../../services/Challenge/Challenge";
import AppErrors from "../../../../services/Error/AppErrors";
import { addError } from "../../../../services/Error/Error";
import {
  fetchProject,
  fetchProjectActivity,
  fetchProjectsById,
} from "../../../../services/Project/Project";
import WithCurrentUser from "../../../HOCs/WithCurrentUser/WithCurrentUser";

/**
 * WithCurrentProject makes available to the WrappedComponent the current
 * project from the route as well as relevant edit functions. Child
 * challenges can optionally be requested, which will be presented as
 * a challenges prop (not embedded within the project object).
 *
 * Supported options:
 * - includeChallenges
 * - includeComments
 * - historicalMonths
 * - defaultToOnlyProject
 * - restrictToGivenProjects
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithCurrentProject = function (WrappedComponent, options = {}) {
  return class extends Component {
    state = {
      loadingProject: true,
      loadingChallenges: options.includeChallenges,
      loadingChallengeStats: false,
      challengeStatsAvailable: false,
      challengeLimitExceeded: false,
    };

    routedProjectId = (props) => parseInt(props.match?.params?.projectId, 10);

    routedChallengeId = (props) => parseInt(props.match?.params?.challengeId, 10);

    currentProjectId = (props) => {
      let projectId = this.routedProjectId(props);

      // If there is no routed project, but we've been given only a single
      // project and the defaultToOnlyProject option is true, then go ahead and
      // use that project.
      if (
        !Number.isFinite(projectId) &&
        options.defaultToOnlyProject &&
        (props.projects?.length ?? 0) === 1
      ) {
        projectId = props.projects[0].id;
      } else if (Number.isFinite(projectId) && options.restrictToGivenProjects) {
        if (!_find(props.projects, { id: projectId })) {
          projectId = null;
        }
      }

      return projectId;
    };

    challengeProjects = (projectId) => {
      const allChallenges = _values(this.props.entities?.challenges ?? {});
      return _filter(allChallenges, (challenge) => {
        return (
          challenge.parent === projectId ||
          _find(challenge.virtualParents, (vp) => {
            return _isObject(vp) ? vp.id === projectId : vp === projectId;
          })
        );
      });
    };

    loadProject = (props) => {
      if (props.loadingProjects) {
        return;
      }

      let projectId = this.currentProjectId(props);

      if (
        Number.isFinite(this.routedProjectId(props)) &&
        projectId === null &&
        !this.state.loadingProject
      ) {
        this.props.notManagerError();
        props.history.push("/admin/projects");
        return;
      }

      if (projectId === null) {
        projectId = this.routedProjectId(props);
      }

      if (Number.isFinite(projectId)) {
        this.setState({
          loadingProject: true,
          loadingChallenges: options.includeChallenges,
        });

        props
          .fetchProject(projectId)
          .then((normalizedProject) => {
            const project = normalizedProject.entities.projects[normalizedProject.result];

            if (!options.allowNonManagers) {
              const manager = AsManager(this.props.user);
              if (!manager.canManage(project)) {
                // If we have a challenge id too, route to the browse url for the challenge
                const challengeId = this.routedChallengeId(this.props);
                if (Number.isFinite(challengeId)) {
                  props.history.replace(`/browse/challenges/${challengeId}`);
                } else {
                  this.props.notManagerError();
                  props.history.push("/admin/projects");
                }
                return;
              }
            }

            this.setState({ loadingProject: false });
          })
          .catch((error) => {
            // Handle any errors that occurred during project fetching
            console.error("Error fetching project:", error);
            this.setState({ loadingProject: false });
          });

        if (options.includeChallenges) {
          const retrievals = [];
          retrievals.push(
            props.fetchProjectChallenges(projectId).then((result) => {
              // If the current project is a virtual project then it's possible
              // the child challenges have parent projects that haven't been
              // fetched yet. We need to fetch those so we can show their names.
              const missingProjects = [];
              if (result?.entities?.challenges) {
                for (const challenge of Object.values(result.entities.challenges)) {
                  if (!_isObject(challenge.parent)) {
                    if (!this.props.entities.projects[challenge.parent]) {
                      missingProjects.push(challenge.parent);
                    }
                  }
                }
              }
              if (missingProjects.length > 0) {
                this.props.fetchProjectsById(missingProjects);
              }
            }),
          );

          if (options.includeComments) {
            retrievals.push(props.fetchProjectChallengeComments(projectId));
          }

          Promise.all(retrievals).then(() => {
            this.setState({ loadingChallenges: false });
          });
        }
      } else {
        this.setState({ loadingProject: false, loadingChallenges: false });
      }
    };

    loadChallengeStats = (project) => {
      this.setState({ loadingChallengeStats: true, challengeStatsAvailable: true });

      // Used for burndown chart
      let activityStartDate = new Date(project.created);
      const challenges = _sortBy(this.challengeProjects(project.id, this.props), ["created"]);

      if (challenges.length < window.env.REACT_APP_PROJECT_CHALLENGE_LIMIT + 1) {
        const earliestChallenge = challenges.pop();
        if (earliestChallenge) {
          activityStartDate = earliestChallenge.created;
        }

        const promises = [
          this.props.fetchProjectChallengeActions(project.id),
          this.props.fetchProjectActivity(project.id, activityStartDate),
          this.props.fetchLatestProjectChallengeActivity(project.id),
        ];

        return Promise.all(promises).then(() => this.setState({ loadingChallengeStats: false }));
      } else {
        this.setState({
          loadingChallengeStats: false,
          challengeStatsAvailable: false,
          challengeLimitExceeded: true,
        });
      }
    };

    componentDidMount() {
      this.loadProject(this.props);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.loadingProjects && !this.props.loadingProjects) {
        this.loadProject(this.props);
        return;
      }

      const nextProjectId = this.currentProjectId(this.props);
      if (Number.isFinite(nextProjectId) && nextProjectId !== this.currentProjectId(prevProps)) {
        this.loadProject(this.props);
      }
    }

    render() {
      const projectId = this.currentProjectId(this.props);
      const project = !Number.isFinite(projectId)
        ? null
        : this.props.entities?.projects?.[projectId];
      let challenges = this.props.challenges; // pass through challenges by default

      if (options.includeChallenges && Number.isFinite(projectId)) {
        challenges = _map(this.challengeProjects(projectId, this.props), (challenge) =>
          denormalize(challenge, challengeDenormalizationSchema(), this.props.entities),
        );
      }

      return (
        <WrappedComponent
          {..._omit(this.props, [
            "entities",
            "notManagerError",
            "fetchProject",
            "fetchProjectChallenges",
          ])}
          project={project}
          challenges={challenges}
          activity={project?.activity}
          routedProjectId={this.routedProjectId(this.props)}
          loadingProject={this.state.loadingProject}
          loadingChallenges={this.state.loadingChallenges}
          loadingChallengeStats={this.state.loadingChallengeStats}
          challengeLimitExceeded={this.state.challengeLimitExceeded}
          loadChallengeStats={this.loadChallengeStats}
          challengeStatsAvailable={this.state.challengeStatsAvailable}
        />
      );
    }
  };
};

const mapStateToProps = (state) => ({
  entities: state.entities,
});

const mapDispatchToProps = (dispatch) => ({
  fetchProject: (projectId) => dispatch(fetchProject(projectId)),
  fetchProjectActivity: (projectId, startDate) =>
    dispatch(fetchProjectActivity(projectId, startDate)),
  fetchProjectChallenges: (projectId) => dispatch(fetchProjectChallenges(projectId, 300)),
  fetchLatestProjectChallengeActivity: (projectId) =>
    dispatch(fetchLatestProjectChallengeActivity(projectId)),
  fetchProjectChallengeActions: (projectId) => dispatch(fetchProjectChallengeActions(projectId)),
  fetchProjectChallengeComments: (projectId) => dispatch(fetchProjectChallengeComments(projectId)),
  fetchProjectsById: (projectIds) => dispatch(fetchProjectsById(projectIds)),
  notManagerError: () => dispatch(addError(AppErrors.project.notManager)),
});

export default (WrappedComponent, options) =>
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(WithCurrentUser(WithCurrentProject(WrappedComponent, options)));
