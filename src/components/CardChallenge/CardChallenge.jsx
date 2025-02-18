import classNames from "classnames";
import { parseISO } from "date-fns";
import _isEmpty from "lodash/isEmpty";
import _isObject from "lodash/isObject";
import _noop from "lodash/noop";
import PropTypes from "prop-types";
import { Component } from "react";
import { FormattedDate, FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import { messagesByDifficulty } from "../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty";
import { isUsableChallengeStatus } from "../../services/Challenge/ChallengeStatus/ChallengeStatus";
import BusySpinner from "../BusySpinner/BusySpinner";
import ChallengeProgress from "../ChallengeProgress/ChallengeProgress";
import Dropdown from "../Dropdown/Dropdown";
import WithStartChallenge from "../HOCs/WithStartChallenge/WithStartChallenge";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import Taxonomy from "../Taxonomy/Taxonomy";
import messages from "./Messages";

export class CardChallenge extends Component {
  render() {
    const vpList = [];

    // If we are searching for a project name let's also surface matching
    // virtual projects.
    if (this.props.challenge.parent && this.props.projectQuery) {
      const virtualParents = this.props.challenge?.virtualParents ?? [];
      for (let i = 0; i < virtualParents.length; i++) {
        const vp = virtualParents[i];
        if (_isObject(vp) && vp.enabled && vp.id !== this.props.excludeProjectId) {
          if (vp.displayName.toLowerCase().match(this.props.projectQuery.toLowerCase())) {
            vpList.push(
              <span key={vp.id}>
                {vpList.length > 0 && (
                  <span className="mr-mr-1 mr-text-grey-light mr-text-xs">,</span>
                )}
                <span className="mr-text-grey-light mr-text-xs">
                  <Link
                    className="hover:mr-text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    to={`/browse/projects/${vp.id}`}
                  >
                    {vp.displayName}
                  </Link>
                </span>
              </span>,
            );
          }
        }
      }
    }

    return (
      <article
        ref={(node) => (this.node = node)}
        className={classNames(
          `${isUsableChallengeStatus(this.props.challenge?.status) ? "mr-card-challenge" : "mr-card-challenge mr-bg-white-10"}`,
          this.props.className,
          { "is-active": this.props.isExpanded },
        )}
      >
        {!_isEmpty(this.props.info) && (
          <Dropdown
            className="mr-float-right mr-dropdown--right"
            innerClassName="mr-bg-blue-darker"
            dropdownButton={(dropdown) => (
              <button
                type="button"
                onClick={dropdown.toggleDropdownVisible}
                className="mr-ml-4 mr-flex"
              >
                <SvgSymbol
                  sym="info-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-green-lighter mr-w-4 mr-h-4"
                />
              </button>
            )}
            dropdownContent={() => (
              <div className="mr-w-96 mr-max-w-screen60 mr-whitespace-normal">
                {this.props.info}
              </div>
            )}
          />
        )}
        <header className="mr-card-challenge__header" onClick={this.props.cardClicked}>
          <div className="mr-max-w-full">
            <Taxonomy {...this.props} {...this.props.challenge} />
            <h3 className="mr-card-challenge__title">
              <Link
                to={{
                  pathname: `/browse/challenges/${this.props.challenge.id}`,
                  state: { fromSearch: true },
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {this.props.challenge.name}
              </Link>
            </h3>

            {this.props.challenge.parent && // virtual challenges don't have projects
              this.props.challenge.parent.id !== this.props.excludeProjectId && (
                <Link
                  className="mr-card-challenge__owner"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  to={`/browse/projects/${this.props.challenge.parent.id}`}
                >
                  {this.props.challenge?.parent?.displayName}
                </Link>
              )}
            {vpList.length > 0 && (
              <div className="mr-mt-2 mr-leading-none">
                <span className="mr-mr-1 mr-text-yellow mr-text-xs">
                  <FormattedMessage
                    {...messages.vpListLabel}
                    values={{ count: vpList?.length ?? 0 }}
                  />
                </span>
                {vpList}
              </div>
            )}
          </div>
        </header>
        {this.props.challenge?.status === 5 ? (
          <FormattedMessage {...messages.completedChallengeLabel} />
        ) : null}
        {this.props.isExpanded && (
          <div className="mr-card-challenge__content">
            {!this.props.challenge.isVirtual && (
              <ol className="mr-card-challenge__meta">
                <li>
                  <strong className="mr-text-yellow">
                    <FormattedMessage {...messages.difficulty} />:
                  </strong>{" "}
                  <FormattedMessage {...messagesByDifficulty[this.props.challenge.difficulty]} />
                </li>
                <li>
                  <strong className="mr-text-yellow">
                    <FormattedMessage {...messages.lastTaskRefreshLabel} />:
                  </strong>{" "}
                  <FormattedDate
                    value={parseISO(this.props.challenge.dataOriginDate)}
                    year="numeric"
                    month="long"
                    day="2-digit"
                  />
                </li>
                {/* Disable Link tell project leaderboard page is reimplemented */}
                {/* <li>
                <Link
                  className="mr-text-green-lighter hover:mr-text-white"
                  to={`/challenge/${this.props.challenge.id}/leaderboard`}
                >
                  <FormattedMessage {...messages.viewLeaderboard} />
                </Link>
              </li> */}
              </ol>
            )}

            <div className="mr-card-challenge__description">
              <MarkdownContent
                markdown={this.props.challenge.description || this.props.challenge.blurb}
              />
            </div>

            <ChallengeProgress className="mr-mt-4 mr-mb-12" challenge={this.props.challenge} />

            <ul className="mr-card-challenge__actions">
              {this.props.startControl !== undefined && (
                <li>{this.props.isLoading ? <BusySpinner inline /> : this.props.startControl}</li>
              )}
              {(this.props.saveControl !== undefined || this.props.unsaveControl !== undefined) && (
                <li>
                  {this.props.saveControl}
                  {this.props.unsaveControl}
                </li>
              )}
              {this.props.manageControl !== undefined && <li>{this.props.manageControl}</li>}
            </ul>
          </div>
        )}
      </article>
    );
  }
}

CardChallenge.propTypes = {
  /** The challenge to display */
  challenge: PropTypes.object.isRequired,
  /** Invoked if the user wants to start working on the challenge */
  startChallenge: PropTypes.func.isRequired,
  /** Set to true if card should be in expanded view */
  isExpanded: PropTypes.bool,
  /** Invoked when the card is clicked, if provided */
  cardClicked: PropTypes.func,
  /** Set to true if this challenge has been saved by the user */
  isSaved: PropTypes.bool,
  /** Optional control to be used for saving the challenge */
  saveControl: PropTypes.node,
  /** Optional control to be used for unsaving the challenge */
  unsaveControl: PropTypes.node,
  /** Optional control to be used for starting the challenge */
  startControl: PropTypes.node,
  /** Optional control to be used to manage the challenge as an owner */
  manageControl: PropTypes.node,
  /** Set to true if challenge data is still being loaded */
  isLoading: PropTypes.bool,
};

CardChallenge.defaultProps = {
  isExpanded: true,
  isSaved: false,
  isLoading: false,
  cardClicked: _noop,
};

export default WithStartChallenge(CardChallenge);
