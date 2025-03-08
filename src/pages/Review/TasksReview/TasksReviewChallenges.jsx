import _cloneDeep from "lodash/cloneDeep";
import _debounce from "lodash/debounce";
import _filter from "lodash/filter";
import _map from "lodash/map";
import _merge from "lodash/merge";
import _toLower from "lodash/toLower";
import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import BusySpinner from "../../../components/BusySpinner/BusySpinner";
import WithReviewChallenges from "../../../components/HOCs/WithReviewChallenges/WithReviewChallenges";
import SearchBox from "../../../components/SearchBox/SearchBox";
import messages from "./Messages";

/**
 * Presents a list of challenges (and parent projects) that have associated
 * reviews for a user to choose before loading the review tasks table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
class TasksReviewChallenges extends Component {
  state = {
    searchQuery: {},
  };

  componentDidMount() {
    this.debouncedSearch = _debounce(this.executeSearch, 800);
  }

  componentWillUnmount() {
    this.debouncedSearch.cancel();
  }

  performSearch = (search, type) => {
    const searchQuery = _cloneDeep(this.state.searchQuery);

    searchQuery[this.props.reviewTasksType] = _merge({}, searchQuery[this.props.reviewTasksType], {
      [type]: search,
    });

    this.setState({ searchQuery }, () => {
      this.debouncedSearch(type);
    });
  };

  executeSearch = (type) => {
    // Get the current search queries for both project and challenge
    const projectSearchQuery =
      this.state.searchQuery?.[this.props.reviewTasksType]?.project || null;

    const challengeSearchQuery =
      this.state.searchQuery?.[this.props.reviewTasksType]?.challenge || null;

    // Always pass both search queries to ensure both filters are applied
    this.props.updateReviewChallenges(
      this.props.reviewTasksType,
      projectSearchQuery,
      challengeSearchQuery,
    );
  };

  render() {
    // Handle loading state or empty data gracefully
    if (!this.props.challenges || this.props.loading) {
      return (
        <div className="mr-mt-8">
          <h3 className="mr-flex mr-justify-between mr-items-center mr-ml-8">
            <span>
              <FormattedMessage {...messages.chooseFilter} />
            </span>

            <div
              className="mr-inline-block mr-mx-4 mr-text-green-lighter mr-text-sm hover:mr-text-white mr-cursor-pointer"
              onClick={() => this.props.selectProject("")}
            >
              <FormattedMessage {...messages.viewAllTasks} />
            </div>
          </h3>
          <BusySpinner />
        </div>
      );
    }

    // Ensure we have arrays even if the data is missing
    const challenges = this.props.challenges || [];
    const projects =
      _filter(
        _map(challenges, (challenge) => ({
          id: challenge.parentId,
          displayName: challenge.parentName,
        })),
        (project, index, array) => index === array.findIndex((p) => p.id === project.id),
      ) || [];

    const challengeList = _map(challenges, (challenge) => {
      return (
        <div
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-mb-2"
          onClick={() => this.props.selectChallenge(challenge.id, challenge.name)}
          key={challenge.id}
        >
          {challenge.name}
        </div>
      );
    });

    const projectList = _map(projects, (project) => {
      return (
        <div
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-mb-2"
          onClick={() => this.props.selectProject(project.id, project.displayName)}
          key={project.id}
        >
          {project.displayName}
        </div>
      );
    });

    const projectSearchBox = (
      <SearchBox
        setSearch={(search) => this.performSearch(search, "project")}
        clearSearch={() => this.performSearch(null, "project")}
        searchQuery={{ query: this.state.searchQuery?.[this.props.reviewTasksType]?.project }}
      />
    );

    const challengeSearchBox = (
      <SearchBox
        setSearch={(search) => this.performSearch(search, "challenge")}
        clearSearch={() => this.performSearch(null, "challenge")}
        searchQuery={{ query: this.state.searchQuery?.[this.props.reviewTasksType]?.challenge }}
      />
    );

    return (
      <div className="mr-mt-8">
        <h3 className="mr-flex mr-justify-between mr-items-center mr-ml-8">
          <span>
            <FormattedMessage {...messages.chooseFilter} />
          </span>

          <div
            className="mr-inline-block mr-mx-4 mr-text-green-lighter mr-text-sm hover:mr-text-white mr-cursor-pointer"
            onClick={() => this.props.selectProject("")}
          >
            <FormattedMessage {...messages.viewAllTasks} />
          </div>
        </h3>

        <div className="mr-flex mr-justify-left mr-p-8">
          <div className="mr-card-widget mr-w-full mr-mr-8 mr-p-4 mr-max-h-screen50">
            <div className="mr-flex mr-justify-between mr-items-center mr-pb-4">
              <h2 className="mr-card-widget__title">
                <FormattedMessage {...messages.reviewByProject} />
              </h2>
              {projectSearchBox}
            </div>
            <div className="mr-overflow-y-scroll">{projectList}</div>
          </div>
          <div className="mr-card-widget mr-w-full mr-p-4 mr-max-h-screen50">
            <div className="mr-flex mr-justify-between mr-items-center mr-pb-4">
              <h2 className="mr-card-widget__title">
                <FormattedMessage {...messages.reviewByChallenge} />
              </h2>
              {challengeSearchBox}
            </div>
            <div className="mr-overflow-y-scroll">{challengeList}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default WithReviewChallenges(injectIntl(TasksReviewChallenges));
