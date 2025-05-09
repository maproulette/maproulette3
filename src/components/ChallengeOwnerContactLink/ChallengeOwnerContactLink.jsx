import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithErrors from "../HOCs/WithErrors/WithErrors";
import messages from "./Messages";

export const JoinChallengeDiscussionLink = (props) => {
  return (
    <Link to={`/browse/challenges/${props.challengeId}?tab=conversation`}>
      <FormattedMessage {...messages.joinChallengeDiscussionLabel} />
    </Link>
  );
};

export class ChallengeOwnerContactLinkInternal extends Component {
  state = {
    contactUrl: null,
    osmUsername: null,
    updatingUrl: false,
  };

  updateContactOwnerUrl = () => {
    const ownerOSMId = this.props.task?.parent?.owner || this.props.task?.parent?.parent?.owner;
    if (Number.isFinite(ownerOSMId) && ownerOSMId > 0) {
      this.setState({ updatingUrl: true });
      this.props
        .fetchOSMUser(ownerOSMId)
        .then((osmUserData) => {
          const username = osmUserData.displayName;

          this.setState({
            contactUrl: `https://www.openstreetmap.org/message/new/${username}`,
            osmUsername: username,
            updatingUrl: false,
          });
        })
        .catch(() => {
          this.setState({ updatingUrl: false });
        });
    } else {
      this.props.addError(messages.noOwnerFound);
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps?.task?.parent?.owner !== this.props.task?.parent?.owner) {
      this.setState({
        contactUrl: null,
        osmUsername: null,
        updatingUrl: false,
      });
    }
  }

  render() {
    if (this.state.updatingUrl) {
      return <BusySpinner inline />;
    }

    if (!this.state.contactUrl) {
      return (
        <span className="mr-text-green-lighter mr-links-green-lighter">
          <a onClick={this.updateContactOwnerUrl}>
            <FormattedMessage {...messages.contactOwnerLabel} />
          </a>
        </span>
      );
    }

    return (
      <a href={this.state.contactUrl} target="_blank" rel="noopener noreferrer">
        <FormattedMessage
          {...messages.contactLinkLabel}
          values={{ owner: this.state.osmUsername }}
        />
      </a>
    );
  }
}

ChallengeOwnerContactLinkInternal.propTypes = {
  task: PropTypes.object,
  fetchOSMUser: PropTypes.func.isRequired,
};

const ChallengeOwnerContactLink = WithErrors(ChallengeOwnerContactLinkInternal);

export default ChallengeOwnerContactLink;
