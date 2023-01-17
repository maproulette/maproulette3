import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { FormattedMessage, FormattedDate, injectIntl } from "react-intl";
import classNames from "classnames";
import _isObject from "lodash/isObject";
import _get from "lodash/get";
import _findIndex from "lodash/findIndex";
import parse from "date-fns/parse";
import MapPane from "../EnhancedMap/MapPane/MapPane";
import TaskClusterMap from "../TaskClusterMap/TaskClusterMap";
import { messagesByDifficulty } from "../../services/Challenge/ChallengeDifficulty/ChallengeDifficulty";
import { isUsableChallengeStatus } from "../../services/Challenge/ChallengeStatus/ChallengeStatus";
import messages from "./Messages";
import BusySpinner from "../BusySpinner/BusySpinner";
import Taxonomy from "../Taxonomy/Taxonomy";
import ChallengeProgress from "../ChallengeProgress/ChallengeProgress";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import SignInButton from "../SignInButton/SignInButton";
import AsManager from "../../interactions/User/AsManager";
import WithStartChallenge from "../HOCs/WithStartChallenge/WithStartChallenge";
import WithBrowsedChallenge from "../HOCs/WithBrowsedChallenge/WithBrowsedChallenge";
import WithClusteredTasks from "../HOCs/WithClusteredTasks/WithClusteredTasks";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import WithChallengeTaskClusters from "../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters";
import WithTaskClusterMarkers from "../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers";
import { fromLatLngBounds } from "../../services/MapBounds/MapBounds";
import { ChallengeCommentsPane } from "./ChallengeCommentsPane";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import FlagModal from "./FlagModal";

const ClusterMap = WithChallengeTaskClusters(
  WithTaskClusterMarkers(TaskClusterMap("challengeDetail"))
);

const FLAG_REPO_NAME = process.env.REACT_APP_GITHUB_ISSUES_API_REPO
const FLAG_REPO_OWNER = process.env.REACT_APP_GITHUB_ISSUES_API_OWNER
const FLAG_TOKEN = process.env.REACT_APP_GITHUB_ISSUES_API_TOKEN
const FLAGGING_ACTIVE = FLAG_REPO_NAME && FLAG_REPO_OWNER && FLAG_TOKEN

/**
 * ChallengeDetail represents a specific challenge view. It presents an
 * overview of the challenge and allows the user to choose to start
 * working on the challenge.
 *
 * @author [Ryan Scherler](https://github.com/ryanscherler)
 */
export class ChallengeDetail extends Component {

  state = {
    viewComments: _isObject(this.props.user) && this.props.location.search.includes("conversation"),
    flagLoading: true,
    issue: undefined,
    displayInputError: false,
    displayCheckboxError: false,
    submittingFlag: false,
  };

  queryForIssue = async (id) => {
    this.setState({ flagLoading: true });

    const owner = process.env.REACT_APP_GITHUB_ISSUES_API_OWNER
    const repo = process.env.REACT_APP_GITHUB_ISSUES_API_REPO
    const query = `q='Reported+Challenge+${encodeURIComponent('#') + id}'+in:title+state:open+repo:${owner}/${repo}`;
    const response = await fetch(`https://api.github.com/search/issues?${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.github.text-match+json'
      },
    })

    if (response.ok) {
      const body = await response.json()
      if (body?.total_count) {
        this.setState({ issue: body.items[0] })
      }

      this.setState({ flagLoading: false })
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0)

    const { url, params } = this.props.match

    if (FLAGGING_ACTIVE && !url.includes('virtual')) {
      this.queryForIssue(params.challengeId)
    }
  }

  componentDidUpdate() {
    if (!_isObject(this.props.user) && this.state.viewComments) {
      this.setState({ viewComments: false });
    }
  }

  onClickTab = () => {
    this.setState({ ...this.state, viewComments: !this.state.viewComments});
  };

  onCancel = () => {
    this.setState({ ...this.state, flagModal: false });
  }

  onModalSubmit = (data) => {
    this.setState({ ...this.state, flagModal: false, displayInputError: false, issue: data });
  }

  handleInputError = () => {
    this.setState({...this.state, displayInputError: !this.state.displayInputError})
  }

  handleCheckboxError = () => {
    this.setState({ ...this.state, displayInputError: false, displayCheckboxError: !this.state.displayCheckboxError})
  }

  handleViewCommentsSubmit = () => {
     this.setState({ ...this.state, viewComments: true})
  }

  render() {
    const challenge = this.props.browsedChallenge;
    if (!_isObject(challenge) || this.props.loadingBrowsedChallenge) {
      return (
        <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-min-h-screen-50 mr-items-center mr-justify-center lg:mr-flex mr-text-center mr-py-8">
          <BusySpinner />
        </div>
      );
    }
  
    // Setup saved status and controls based on whether the user has saved this
    // challenge
    let isSaved = false;
    let unsaveControl = null;
    let saveControl = null;
    let startControl = null;

    const startableChallenge =
      !challenge.deleted && isUsableChallengeStatus(challenge.status);
    const tabMessage = this.state.viewComments
      ? messages.viewOverview
      : messages.viewComments;

    if (_isObject(this.props.user) && !challenge.isVirtual) {
      if (
        _findIndex(this.props.user.savedChallenges, { id: challenge.id }) !== -1
      ) {
        isSaved = true;
        unsaveControl = (
          <Link
            to={{}}
            onClick={() =>
              this.props.unsaveChallenge(this.props.user.id, challenge.id)
            }
            className="mr-button"
            title={this.props.intl.formatMessage(messages.removeFromFavorites)}
          >
            <FormattedMessage {...messages.unfavorite} />
          </Link>
        );
      } else {
        saveControl = (
          <Link
            to={{}}
            onClick={() =>
              this.props.saveChallenge(this.props.user.id, challenge.id)
            }
            className="mr-button"
            title={this.props.intl.formatMessage(messages.saveToFavorites)}
          >
            <FormattedMessage {...messages.favorite} />
          </Link>
        );
      }
    }

    // Users need to be signed in to start a challenge
    if (!_isObject(this.props.user)) {
      startControl = <SignInButton {...this.props} longForm className="" />;
    } else {
      startControl = (
        <Link
          to={{}}
          className="mr-button"
          onClick={() => this.props.startChallenge(challenge)}
        >
          <FormattedMessage {...messages.start} />
        </Link>
      );
    }

    // Does this user own (or can manage) the current challenge?
    const isManageable = AsManager(this.props.user).canManageChallenge(
      challenge
    );

    const manageControl = !isManageable ? null : (
      <Link
        to={`/admin/project/${challenge.parent.id}/challenge/${challenge.id}`}
        className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
      >
        <FormattedMessage {...messages.manageLabel} />
      </Link>
    );

    const dataOriginDateText = !challenge.dataOriginDate
      ? null
      : this.props.intl.formatMessage(messages.dataOriginDateLabel, {
          refreshDate: this.props.intl.formatDate(
            parse(challenge.lastTaskRefresh)
          ),
          sourceDate: this.props.intl.formatDate(
            parse(challenge.dataOriginDate)
          ),
        });

    const handleFlagClick = () => {
      if (this.state.issue) {
        window.open(this.state.issue?.html_url, "_blank")
      } else {
        this.setState({ flagModal: true })
      }
    }

    const map = (
      <ClusterMap
        className="split-pane"
        onTaskClick={(taskId) =>
          this.props.startChallengeWithTask(challenge.id, false, taskId)
        }
        challenge={challenge}
        allowClusterToggle={false}
        criteria={{
          boundingBox: fromLatLngBounds(this.state.bounds),
          zoom: this.state.zoom,
        }}
        updateTaskFilterBounds={(bounds, zoom) =>
          this.setState({ bounds, zoom })
        }
        skipRefreshTasks
        allowSpidering
        {...this.props}
      />
    );

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white lg:mr-flex">
        <div className="mr-flex-1">
          <MapPane>{map}</MapPane>
        </div>
        <div className="mr-flex-1">
          <div className="mr-h-content mr-overflow-auto">
            <div className="mr-max-w-md mr-mx-auto">
              <div className="mr-py-6 mr-px-8">
                {_get(this.props, "history.location.state.fromSearch") && (
                  <div className="mr-mb-4">
                    <button
                      className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
                      onClick={() => this.props.history.goBack()}
                    >
                      &larr; <FormattedMessage {...messages.goBack} />
                    </button>
                  </div>
                )}
                <Taxonomy {...challenge} isSaved={isSaved} />
                <div className="mr-flex mr-items-center">
                  <h1 className="mr-card-challenge__title mr-mr-3">{challenge.name}</h1>
                  {FLAGGING_ACTIVE && !this.state.flagLoading && !challenge.isVirtual &&
                    <div title={!this.state.issue ? 'Flag challenge' : 'View github issue'} className="mr-flex mr-align-center mr-cursor-pointer" onClick={handleFlagClick}>
                      <SvgSymbol sym="flag-icon" viewBox="0 0 20 20" className={`mr-w-4 mr-h-4 mr-fill-current mr-mr-2${this.state.issue ? ' mr-fill-red-light mr-mt-4px' : ''}`} />
                      {this.state.issue &&
                        <div className="mr-text-red-light">
                          <FormattedMessage {...messages.flaggedText} />
                        </div>
                      }
                    </div>
                  }
                </div>
                {this.state.flagModal &&
                  <FlagModal
                    {...this.props}
                    challenge={challenge}
                    onCancel={this.onCancel}
                    onModalSubmit={this.onModalSubmit}
                    handleInputError={this.handleInputError}
                    displayInputError={this.state.displayInputError}
                    displayCheckboxError={this.state.displayCheckboxError}
                    handleCheckboxError={this.handleCheckboxError}
                    handleViewCommentsSubmit={this.handleViewCommentsSubmit}
                  />
                }
                {challenge.parent && ( // virtual challenges don't have projects
                  <Link
                    className="mr-card-challenge__owner"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    to={`/browse/projects/${challenge.parent.id}`}
                  >
                    {challenge.parent.displayName}
                  </Link>
                )}

                <div className="mr-card-challenge__content">
                  {!challenge.isVirtual && (
                    <ol className="mr-card-challenge__meta">
                      <li>
                        <strong className="mr-text-yellow">
                          <FormattedMessage {...messages.difficulty} />:
                        </strong>{" "}
                        <FormattedMessage
                          {...messagesByDifficulty[challenge.difficulty]}
                        />
                      </li>
                      <li title={dataOriginDateText}>
                        <strong className="mr-text-yellow">
                          <FormattedMessage
                            {...messages.lastTaskRefreshLabel}
                          />
                          :
                        </strong>{" "}
                        <FormattedDate
                          value={parse(challenge.dataOriginDate)}
                          year="numeric"
                          month="long"
                          day="2-digit"
                        />
                      </li>
                      <li>
                        <Link
                          className="mr-text-green-lighter hover:mr-text-white"
                          to={`/challenge/${challenge.id}/leaderboard`}
                        >
                          <FormattedMessage {...messages.viewLeaderboard} />
                        </Link>
                        {_isObject(this.props.user) && !challenge.isVirtual && (
                          <Fragment>
                            <span className="mr-px-3"> | </span>
                            <Link
                              className="mr-text-green-lighter hover:mr-text-white"
                              onClick={this.onClickTab}
                            >
                              <FormattedMessage {...tabMessage} />
                            </Link>
                          </Fragment>
                        )}
                      </li>
                    </ol>
                  )}

                  {this.state.viewComments ? (
                    <ChallengeCommentsPane
                      challengeId={this.props}
                      osmId={this.props.user?.osmProfile?.id}
                      owner={this.props.browsedChallenge?.owner}
                    />
                  ) : (
                    <Fragment>
                      <div className="mr-card-challenge__description">
                        <MarkdownContent
                          markdown={challenge.description || challenge.blurb}
                        />
                      </div>

                      <ChallengeProgress
                        className="mr-my-4"
                        challenge={challenge}
                      />

                      <ul className="mr-card-challenge__actions">
                        {startableChallenge && startControl && (
                          <li>{startControl}</li>
                        )}
                        {(saveControl || unsaveControl) && (
                          <li>
                            {saveControl}
                            {unsaveControl}
                          </li>
                        )}
                        <li>
                          {!challenge.isVirtual &&
                            _get(this.props.user, "settings.isReviewer") && (
                              <Link
                                className={classNames(
                                  "mr-text-green-lighter hover:mr-text-white mr-mr-4 mr-leading-none",
                                  {
                                    "mr-border-r-2 mr-border-white-10 mr-pr-4 mr-mr-4":
                                      manageControl,
                                  }
                                )}
                                to={`/review?challengeId=${
                                  challenge.id
                                }&challengeName=${encodeURIComponent(
                                  challenge.name
                                )}`}
                              >
                                <FormattedMessage {...messages.viewReviews} />
                              </Link>
                            )}
                          {manageControl}
                        </li>
                      </ul>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WithCurrentUser(
  WithClusteredTasks(
    WithStartChallenge(WithBrowsedChallenge(injectIntl(ChallengeDetail)))
  )
);
