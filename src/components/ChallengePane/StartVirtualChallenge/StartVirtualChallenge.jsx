import classNames from "classnames";
import _isObject from "lodash/isObject";
import _reduce from "lodash/reduce";
import PropTypes from "prop-types";
import { Component } from "react";
import { injectIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import BusySpinner from "../../BusySpinner/BusySpinner";
import QuickTextBox from "../../QuickTextBox/QuickTextBox";
import SignInButton from "../../SignInButton/SignInButton";
import messages from "./Messages";

/**
 * StartVirtualChallenge renders a control for initiating creation of
 * a new virtual challenge. When clicked, the user will be asked for
 * the name of their new virtual challenge, and then cration will be
 * initiated.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class StartVirtualChallenge extends Component {
  state = {
    /** Determines whether to show the name input */
    editingName: false,
    /** Current value of name input */
    challengeName: "",
    creatingVirtualChallenge: false,
  };

  /** Invoked to display the virtual challenge name input field */
  startEditing = () => this.setState({ editingName: true, challengeName: "" });

  /** Updates the current value of the challenge name */
  setChallengeName = (challengeName) => this.setState({ challengeName });

  /** Invoked to successfully complete editing of the name */
  finishEditing = () => {
    this.setState({ creatingVirtualChallenge: true });
    this.props
      .createVirtualChallenge(this.state.challengeName, this.props.selectedClusters)
      .catch(() => null)
      .then(() => this.setState({ creatingVirtualChallenge: false }));

    this.setState({ editingName: false, challengeName: "" });
  };

  /** Invoked to cancel editing of the name */
  cancelEditing = () => this.setState({ editingName: false, challengeName: "" });

  maxAllowedTasks = () => parseInt(window.env?.REACT_APP_VIRTUAL_CHALLENGE_MAX_TASKS ?? 10000);

  render() {
    const taskCount = _reduce(
      this.props.selectedClusters,
      (total, cluster) => total + cluster.numberOfPoints,
      0,
    );

    let creationStep = null;
    if (this.props.creatingVirtualChallenge || this.state.creatingVirtualChallenge) {
      creationStep = (
        <div className="mr-relative">
          <BusySpinner unstyled className="mr-static" />
        </div>
      );
    } else if (taskCount > this.maxAllowedTasks()) {
      creationStep = (
        <div>
          <FormattedMessage {...messages.tooManyTasks} values={{ max: this.maxAllowedTasks() }} />
          <div className="mr-text-xs mr-flex mr-justify-center">
            <FormattedMessage {...messages.selectedCount} values={{ count: taskCount }} />
          </div>
        </div>
      );
    } else if (this.state.editingName) {
      if (!_isObject(this.props.user)) {
        creationStep = <SignInButton {...this.props} longForm className="mr-w-full" />;
      } else {
        creationStep = (
          <QuickTextBox
            inputClassName="mr-min-w-72 mr-bg-blue-dark-75"
            text={this.state.challengeName}
            setText={this.setChallengeName}
            done={this.finishEditing}
            cancel={this.cancelEditing}
            doneLabel={<FormattedMessage {...messages.startLabel} />}
            placeholder={this.props.intl.formatMessage(messages.virtualChallengeNameLabel)}
          />
        );
      }
    } else {
      creationStep = (
        <button
          className={classNames("mr-button mr-w-full", {
            "is-loading": this.props.creatingVirtualChallenge,
          })}
          onClick={this.startEditing}
        >
          <FormattedMessage {...messages.createVirtualChallenge} values={{ taskCount }} />
        </button>
      );
    }

    return (
      <div className="mr-absolute mr-top-0 mr-mt-3 mr-w-full mr-flex mr-justify-center">
        <div className="mr-z-5 mr-flex-col mr-items-center mr-bg-blue-dark-50 mr-text-white mr-rounded">
          <div className="mr-flex mr-items-center mr-py-3 mr-px-3">{creationStep}</div>
        </div>
      </div>
    );
  }
}

StartVirtualChallenge.propTypes = {
  /** Invoked to create the virtual challenge */
  createVirtualChallenge: PropTypes.func.isRequired,
  /** Set to true if the virtual challenge is in process of being created */
  creatingVirtualChallenge: PropTypes.bool,
};

StartVirtualChallenge.defaultProps = {
  creatingVirtualChallenge: false,
};

export default injectIntl(StartVirtualChallenge);
