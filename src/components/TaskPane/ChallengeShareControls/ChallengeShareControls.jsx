import classNames from "classnames";
import PropTypes from "prop-types";
import { Component } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import "./ChallengeShareControls.scss";

export default class ChallengeShareControls extends Component {
  render() {
    if (!this.props.challenge) {
      return null;
    }

    const shareUrl = `${window.env.REACT_APP_URL}/browse/challenges/${this.props.challenge.id}`;
    const title = this.props.title || window.env.REACT_APP_TITLE;
    const hashtag = "maproulette";

    return (
      <div className={classNames("challenge-share-controls", this.props.className)}>
        <div className="share-control">
          <FacebookShareButton url={shareUrl} quote={title}>
            <span className="share-icon">
              <FacebookIcon size={26} round />
            </span>
          </FacebookShareButton>
        </div>

        <div className="share-control">
          <TwitterShareButton url={shareUrl} hashtags={[hashtag]} title={title}>
            <span className="share-icon">
              <TwitterIcon size={26} round />
            </span>
          </TwitterShareButton>
        </div>

        <div className="share-control">
          <EmailShareButton url={shareUrl} subject={title}>
            <span className="share-icon">
              <EmailIcon size={26} round />
            </span>
          </EmailShareButton>
        </div>
      </div>
    );
  }
}

ChallengeShareControls.propTypes = {
  challenge: PropTypes.object,
};
