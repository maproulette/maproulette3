import PropTypes from "prop-types";
import { Component } from "react";
import { Link } from "react-router-dom";
import AsBrowsableChallenge from "../../interactions/Challenge/AsBrowsableChallenge";
import { constructChallengeLink } from "../../utils/constructChangesetUrl";
import BusySpinner from "../BusySpinner/BusySpinner";
import ShareLink from "../ShareLink/ShareLink";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

/**
 * ChallengeNameLink displays a linked name of the parent challenge of the
 * given task, along with a share link.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeNameLink extends Component {
  render() {
    const challenge = this.props.task?.parent || this.props.challenge || {};
    const project = this.props.task?.parent?.parent || this.props.project || {};
    const challengeBrowseRoute = AsBrowsableChallenge(challenge).browseURL();
    const challengeShareLink = constructChallengeLink(challenge?.id);

    return (
      <span className="mr-flex mr-items-baseline mr-relative mr-overflow-hidden">
        {Number.isFinite(this.props.virtualChallengeId) && (
          <span title={this.props.virtualChallenge?.name}>
            <Link
              to={`/browse/virtual/${this.props.virtualChallengeId}`}
              className="mr-leading-normal mr-flex mr-items-baseline"
            >
              {this.props.virtualChallenge?.name ? (
                <span className="mr-text-white hover:mr-text-green-lighter">
                  {this.props.virtualChallenge.name}
                </span>
              ) : (
                <BusySpinner inline />
              )}
              <SvgSymbol
                sym="shuffle-icon"
                viewBox="0 0 20 20"
                className="mr-fill-turquoise mr-w-4 mr-h-4 mr-mx-4"
              />
            </Link>
          </span>
        )}
        <div className="mr-flex mr-flex-col">
          <span title={challenge.name}>
            <Link to={challengeBrowseRoute}>
              <span className="mr-mr-2">{challenge.name}</span>
            </Link>
          </span>
          {this.props.includeProject && (
            <div className="mr-text-xs mr-links-green-lighter mr-mt-1">
              <Link to={`/browse/projects/${project.id}`}>{project.displayName}</Link>
            </div>
          )}
        </div>
        {!this.props.suppressShareLink && <ShareLink link={challengeShareLink} {...this.props} />}
      </span>
    );
  }
}

ChallengeNameLink.propTypes = {
  task: PropTypes.object,
};
