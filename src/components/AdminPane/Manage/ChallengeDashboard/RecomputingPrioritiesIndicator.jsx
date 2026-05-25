import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import BusySpinner from "../../../BusySpinner/BusySpinner";
import messages from "./Messages";

const POLL_INTERVAL = 3000;

/**
 * Inline indicator shown while the backend is recomputing task priorities
 * after a challenge save. Polls `refreshChallenge` every few seconds and
 * disappears as soon as the backend clears `challenge.isRecomputingPriorities`.
 */
export default class RecomputingPrioritiesIndicator extends Component {
  timerHandle = null;

  startPolling = () => {
    if (this.timerHandle === null) {
      this.timerHandle = setInterval(this.props.refreshChallenge, POLL_INTERVAL);
    }
  };

  stopPolling = () => {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle);
      this.timerHandle = null;
    }
  };

  componentDidMount() {
    if (this.props.challenge?.isRecomputingPriorities) {
      this.startPolling();
    }
  }

  componentDidUpdate(prevProps) {
    const wasRecomputing = prevProps.challenge?.isRecomputingPriorities;
    const isRecomputing = this.props.challenge?.isRecomputingPriorities;
    if (isRecomputing && !wasRecomputing) {
      this.startPolling();
    } else if (!isRecomputing && wasRecomputing) {
      this.stopPolling();
    }
  }

  componentWillUnmount() {
    this.stopPolling();
  }

  render() {
    if (!this.props.challenge?.isRecomputingPriorities) {
      return null;
    }
    return (
      <div className="mr-mt-4 mr-flex mr-items-center mr-text-yellow">
        <BusySpinner inline />
        <span className="mr-ml-2">
          <FormattedMessage {...messages.recomputingPriorities} />
        </span>
      </div>
    );
  }
}

RecomputingPrioritiesIndicator.propTypes = {
  challenge: PropTypes.object,
  refreshChallenge: PropTypes.func.isRequired,
};
