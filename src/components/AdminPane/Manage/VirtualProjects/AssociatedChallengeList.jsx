import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import PageResultsButton from "../../../LoadMoreButton/PageResultsButton";
import SvgSymbol from "../../../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * AssociatedChallengeList renders the given challenges as two lists with add/remove
 * buttons.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class AssociatedChallengeList extends Component {
  render() {
    const challengeCards = _map(this.props.challenges, (challenge) => (
      <div className="mr-flex mr-my-4" key={challenge.id}>
        <div className="mr-w-8 mr-mr-2 mr-text-white">
          <SvgSymbol
            className="icon mr-fill-current"
            viewBox="0 0 20 20"
            sym={challenge.enabled ? "visible-icon" : "hidden-icon"}
          />
        </div>
        <div className="mr-flex-grow mr-text-base mr-text-white">
          {this.props.includeId && `(id: ${challenge.id})`} {challenge.name}
          <div className="mr-text-xs mr-text-grey-light">{challenge.parent?.displayName}</div>
        </div>

        <div className="mr-text-sm mr-text-green-lighter">
          {this.props.toBeAdded ? (
            <button
              className="mr-text-current"
              onClick={() => this.props.addChallenge(challenge.id, this.props.project.id)}
            >
              <FormattedMessage {...messages.addLabel} />
            </button>
          ) : (
            <button
              className="mr-text-current"
              onClick={() => this.props.removeChallenge(challenge.id, this.props.project.id)}
            >
              <FormattedMessage {...messages.removeLabel} />
            </button>
          )}
        </div>
      </div>
    ));

    return (
      <div className="">
        {!this.props.loadingChallenges && challengeCards.length === 0 ? null : challengeCards}
        {this.props.setSearchPage && (
          <div className="mr-text-center mr-mt-8">
            <PageResultsButton className="mr-button--green-lighter" {...this.props} />
          </div>
        )}
      </div>
    );
  }
}

AssociatedChallengeList.propTypes = {
  challenges: PropTypes.array.isRequired,
};
