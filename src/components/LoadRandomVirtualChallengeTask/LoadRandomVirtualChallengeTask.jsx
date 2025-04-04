import PropTypes from "prop-types";
import { Component } from "react";
import { connect } from "react-redux";
import { loadRandomTaskFromVirtualChallenge } from "../../services/Task/Task";
import BusySpinner from "../BusySpinner/BusySpinner";

const _LoadRandomVirtualChallengeTask = class extends Component {
  componentDidMount() {
    const virtualChallengeId = parseInt(this.props.match?.params?.virtualChallengeId, 10);

    if (Number.isFinite(virtualChallengeId)) {
      this.props
        .loadRandomTaskFromVirtualChallenge(virtualChallengeId)
        .then((task) =>
          this.props.history.replace(`/virtual/${virtualChallengeId}/task/${task.id}`),
        )
        .catch(() => this.props.history.push(`/browse/challenges`));
    }
  }

  render() {
    return <BusySpinner />;
  }
};

_LoadRandomVirtualChallengeTask.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  loadRandomTaskFromVirtualChallenge: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  loadRandomTaskFromVirtualChallenge: (virtualChallengeId) =>
    dispatch(loadRandomTaskFromVirtualChallenge(virtualChallengeId)),
});

const LoadRandomVirtualChallengeTask = connect(
  null,
  mapDispatchToProps,
)(_LoadRandomVirtualChallengeTask);

export default LoadRandomVirtualChallengeTask;
