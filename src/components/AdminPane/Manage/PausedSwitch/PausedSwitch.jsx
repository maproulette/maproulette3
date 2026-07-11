import _isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import { Component } from "react";
import WithChallengeManagement from "../../HOCs/WithChallengeManagement/WithChallengeManagement";

/**
 * PausedSwitch renders a simple switch, with optional label, that
 * toggles the given challenge's paused status true or false as the
 * switch is activated or deactivated, respectively. While paused, tasks
 * belonging to the challenge cannot be completed or reviewed, but their
 * existing statuses are left untouched.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class PausedSwitch extends Component {
  togglePaused = () => {
    this.props.updatePaused(this.props.challenge.id, !this.props.challenge.paused);
  };

  render() {
    if (_isEmpty(this.props.challenge)) {
      return null;
    }

    return (
      <div className="mr-flex mr-justify-center">
        <label htmlFor="paused-switch-label" className="switch-container">
          <input
            type="checkbox"
            id="paused-switch-label"
            checked={this.props.challenge.paused}
            onChange={() => null}
          />
          <span className="slider round" onClick={this.togglePaused}></span>
        </label>
      </div>
    );
  }
}

PausedSwitch.propTypes = {
  challenge: PropTypes.object,
  updatePaused: PropTypes.func.isRequired,
};

export default WithChallengeManagement(PausedSwitch);
