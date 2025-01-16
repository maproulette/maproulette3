import _isFinite from "lodash/isFinite";
import _omit from "lodash/omit";
import { denormalize } from "normalizr";
import { Component } from "react";
import { connect } from "react-redux";
import AsManageableChallenge from "../../../../interactions/Challenge/AsManageableChallenge";
import {
  challengeDenormalizationSchema,
  challengeResultEntity,
  fetchChallenge,
  fetchChallengeActions,
  fetchChallengeActivity,
  fetchChallengeComments,
} from "../../../../services/Challenge/Challenge";
import AppErrors from "../../../../services/Error/AppErrors";
import { addError } from "../../../../services/Error/Error";
import { fetchBasicUser } from "../../../../services/User/User";
import WithClusteredTasks from "../../../HOCs/WithClusteredTasks/WithClusteredTasks";
import WithChallengeManagement from "../WithChallengeManagement/WithChallengeManagement";

/**
 * WithCurrentChallenge makes available to the WrappedComponent the current
 * challenge from the route as well as relevant admin functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentChallenge = function (WrappedComponent) {
  return class extends Component {
    state = {
      loadingChallenge: true,
    };

    currentChallengeId = () => parseInt(this.props.match?.params?.challengeId, 10);

    loadChallenge = () => {
      const challengeId = this.currentChallengeId();

      if (_isFinite(challengeId)) {
        this.setState({ loadingChallenge: true });

        // Start by fetching the challenge. Then fetch follow-up data.
        return this.props
          .fetchChallenge(challengeId)
          .then((normalizedChallengeData) => {
            const challenge = challengeResultEntity(normalizedChallengeData);

            if (this.props.user) {
              Promise.all([
                this.props.fetchUser(challenge.owner),
                this.props.fetchChallengeComments(challengeId),
                this.props.fetchChallengeActivity(challengeId, new Date(challenge?.created)),
                this.props.fetchChallengeActions(challengeId),
              ]).then(() => this.setState({ loadingChallenge: false }));
            } else {
              this.setState({ loadingChallenge: false });
            }
          })
          .catch((error) => {
            console.error("Error loading challenge:", error);
            this.setState({ loadingChallenge: false });
          });
      } else {
        this.setState({ loadingChallenge: false });
      }
    };

    componentDidMount() {
      this.loadChallenge();
    }

    render() {
      const challengeId = this.currentChallengeId();
      let challenge = null;
      let owner = null;
      let clusteredTasks = null;

      if (_isFinite(challengeId)) {
        challenge = AsManageableChallenge(
          denormalize(
            this.props.entities?.challenges?.[challengeId],
            challengeDenormalizationSchema(),
            this.props.entities,
          ),
        );
        owner = Object.values(this.props.entities.users).find(
          (user) => user.osmProfile.id === challenge.owner,
        );
      }

      return (
        <WrappedComponent
          key={challengeId}
          challenge={challenge}
          owner={owner}
          clusteredTasks={clusteredTasks}
          loadingChallenge={this.state.loadingChallenge}
          refreshChallenge={this.loadChallenge}
          {..._omit(this.props, [
            "entities",
            "fetchChallenge",
            "fetchChallengeComments",
            "clusteredTasks",
            "fetchChallengeActivity",
          ])}
        />
      );
    }
  };
};

const mapStateToProps = (state) => ({
  entities: state.entities,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchChallenge: (challengeId) => {
    return dispatch(fetchChallenge(challengeId)).then((normalizedResults) => {
      if (
        !_isFinite(normalizedResults.result) ||
        normalizedResults?.entities?.challenges?.[normalizedResults.result]?.deleted
      ) {
        dispatch(addError(AppErrors.challenge.doesNotExist));
        ownProps.history.push("/admin/projects");
      }

      return normalizedResults;
    });
  },

  fetchChallengeComments: (challengeId) => dispatch(fetchChallengeComments(challengeId)),

  fetchChallengeActivity: (challengeId, startDate, endDate) =>
    dispatch(fetchChallengeActivity(challengeId, startDate, endDate)),

  fetchChallengeActions: (challengeId, suppressReceive, criteria) =>
    dispatch(fetchChallengeActions(challengeId, suppressReceive, criteria)),

  fetchUser: (userId) => dispatch(fetchBasicUser(userId)),
});

export default (WrappedComponent) =>
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(WithClusteredTasks(WithChallengeManagement(WithCurrentChallenge(WrappedComponent))));
