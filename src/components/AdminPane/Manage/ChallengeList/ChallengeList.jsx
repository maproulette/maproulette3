import _map from "lodash/map";
import _sortBy from "lodash/sortBy";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import ChallengeCard from "../ChallengeCard/ChallengeCard";
import messages from "./Messages";

/**
 * ChallengeList renders the given challenges as a list. If a selectedProject
 * or filteredProjects is given, then challenges will be limited to the
 * specified project(s).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ChallengeList extends Component {
  render() {
    // Show pinned challenges first
    const challengeCards = _sortBy(
      _map(this.props.challenges, (challenge) => {
        const link = this.props.project.isVirtual
          ? `/browse/challenges/${challenge.id}`
          : `/admin/project/${this.props.project.id}/challenge/${challenge.id}`;

        return (
          <ChallengeCard
            {...this.props}
            key={challenge.id}
            challenge={challenge}
            isPinned={this.props.pinnedChallenges.indexOf(challenge.id) !== -1}
            isTallied={this.props.showAsTallied(this.props.project.id, challenge.id)}
            hideTallyControl={this.props.hideTallyControl}
            showProjectName={this.props.project.isVirtual}
            link={link}
            includeCopyURL
          />
        );
      }),
      (challengeCard) => !challengeCard.props.isPinned,
    );

    return (
      <div className="mr-text-base mr-pb-1 mr-pb-36">
        {!this.props.loadingChallenges && challengeCards.length === 0 ? (
          <div className="mr-flex mr-justify-center mr-text-grey-light">
            <FormattedMessage {...messages.noChallenges} />
          </div>
        ) : (
          challengeCards
        )}
      </div>
    );
  }
}

ChallengeList.propTypes = {
  challenges: PropTypes.array.isRequired,
  suppressControls: PropTypes.bool,
};
