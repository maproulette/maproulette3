import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import { FormattedMessage, FormattedDate, injectIntl } from "react-intl";
import classNames from "classnames";
import _isObject from "lodash/isObject";
import _get from "lodash/get";
import _findIndex from "lodash/findIndex";
import _merge from "lodash/merge";
import _uniqBy from "lodash/uniqBy";
import _differenceBy from "lodash/differenceBy";
import { Popup } from 'react-leaflet'
import { parseISO } from "date-fns";
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
import WithCurrentChallenge from "../AdminPane/HOCs/WithCurrentChallenge/WithCurrentChallenge";
import WithChallengeTaskClusters from "../HOCs/WithChallengeTaskClusters/WithChallengeTaskClusters";
import WithTaskClusterMarkers from "../HOCs/WithTaskClusterMarkers/WithTaskClusterMarkers";
import WithManageableProjects from "../AdminPane/HOCs/WithManageableProjects/WithManageableProjects";
import TaskChallengeMarkerContent from "../ChallengePane/TaskChallengeMarkerContent";
import StartVirtualChallenge from "../ChallengePane/StartVirtualChallenge/StartVirtualChallenge";
import { fromLatLngBounds } from "../../services/MapBounds/MapBounds";
import { ChallengeCommentsPane } from "./ChallengeCommentsPane";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import FlagModal from "./FlagModal";
import ProjectPickerModal from "../AdminPane/Manage/ProjectPickerModal/ProjectPickerModal";

const ClusterMap =
  WithChallengeTaskClusters(
    WithTaskClusterMarkers(
      WithCurrentUser(
        TaskClusterMap('challengeDetail')
      )
    ),
    true
  )

const ProjectPicker = WithManageableProjects(ProjectPickerModal);

const FLAG_REPO_NAME = process.env.REACT_APP_GITHUB_ISSUES_API_REPO
const FLAG_REPO_OWNER = process.env.REACT_APP_GITHUB_ISSUES_API_OWNER
const FLAG_TOKEN = process.env.REACT_APP_GITHUB_ISSUES_API_TOKEN
const FLAGGING_ACTIVE = FLAG_REPO_NAME && FLAG_REPO_OWNER && FLAG_TOKEN

const DETAIL_TABS = {
  OVERVIEW: "OVERVIEW",
  COMMENTS: "COMMENTS",
  OVERPASS: "OVERPASS"
}

/**
 * ChallengeDetail represents a specific challenge view. It presents an
 * overview of the challenge and allows the user to choose to start
 * working on the challenge.
 *
 * @author [Ryan Scherler](https://github.com/ryanscherler)
 */
export class ChallengeDetail extends Component {
  state = {
    detailTab: _isObject(this.props.user) && this.props.location.search.includes("conversation") ? DETAIL_TABS.COMMENTS : DETAIL_TABS.OVERVIEW,
    flagLoading: true,
    issue: undefined,
    displayInputError: false,
    displayCheckboxError: false,
    submittingFlag: false,
    pickingProject: false,
    selectedClusters: [],
  };

  onBulkClusterSelection = clusters => {
    if (!clusters || clusters.length === 0) {
      return
    }

    // Handle both clusters and individual tasks in case user declustered
    this.setState({
      selectedClusters: _uniqBy(
        this.state.selectedClusters.concat(clusters), clusters[0].isTask ? 'taskId' : 'clusterId'
      ),
    })
  }

  onBulkClusterDeselection = clusters => {
    if (!clusters || clusters.length === 0) {
      return
    }

    // Handle both clusters and individual tasks in case user declustered
    this.setState({
      selectedClusters: _differenceBy(
        this.state.selectedClusters, clusters, clusters[0].isTask ? 'taskId' : 'clusterId'
      ),
    })
  }

  resetSelectedClusters = () => this.setState({selectedClusters: []})


  componentDidMount() {
    window.scrollTo(0, 0)

    const { url, params } = this.props.match

    if (FLAGGING_ACTIVE && !url.includes('virtual')) {
      this.queryForIssue(params.challengeId)
    }
  }

  componentDidUpdate() {
    if (!_isObject(this.props.user) && this.state.detailTab === DETAIL_TABS.COMMENTS) {
      this.setState({ detailTab: DETAIL_TABS.OVERVIEW });
    }
  }

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

  onClickTab = (detailTab) => {
    this.setState({ detailTab });
  };

  onCancel = () => {
    this.setState({ flagModal: false });
  }

  onModalSubmit = (data) => {
    this.setState({ flagModal: false, displayInputError: false, issue: data });
  }

  handleInputError = () => {
    this.setState({displayInputError: !this.state.displayInputError})
  }

  handleCheckboxError = () => {
    this.setState({ displayInputError: false, displayCheckboxError: !this.state.displayCheckboxError})
  }

  handleViewCommentsSubmit = () => {
     this.setState({ viewComments: true})
  }

  handleFlagClick = () => {
    if (this.state.issue) {
      window.open(this.state.issue?.html_url, "_blank")
    } else {
      this.setState({ flagModal: true })
    }
  }

  projectPickerCanceled = () => {
    this.setState({ pickingProject: false });
  }

  cloneToProject = (project) => {
    this.setState({ pickingProject: false })
    this.props.history.push({
      pathname:
        `/admin/project/${project.id}/` +
        `challenge/${this.props.challenge.id}/clone`,
      state: _merge(
        { projectId: project.id },
        _get(this.props.searchCriteria, 'filters')
      ),
    })
  }

  renderDetailTabs = () => {
    const challenge = this.props.browsedChallenge;
    if (!challenge.isVirtual) {
      return (
        <li>
          <button
            className="mr-text-green-lighter hover:mr-text-white"
            onClick={() => this.onClickTab(DETAIL_TABS.OVERVIEW)}
          >
            <FormattedMessage {...messages.viewOverview} />
          </button>
          {
            _isObject(this.props.user) && (
              <Fragment>
                <span className="mr-px-3"> | </span>
                <button
                  className="mr-text-green-lighter hover:mr-text-white"
                  onClick={() => this.onClickTab(DETAIL_TABS.COMMENTS)}
                >
                  <FormattedMessage {...messages.viewComments} />
                </button>
              </Fragment>
            )
          }
          {
            challenge.overpassQL && (
              <Fragment>
                <span className="mr-px-3"> | </span>
                <button
                  className="mr-text-green-lighter hover:mr-text-white"
                  onClick={() => this.onClickTab(DETAIL_TABS.OVERPASS)}
                >
                  <FormattedMessage {...messages.overpassQL} />
                </button>
              </Fragment>
            )
          }
          {
            _isObject(this.props.user) && challenge.enabled && (
              <Fragment>
                <span className="mr-px-3"> | </span>
                <button
                  onClick={() => this.setState({ pickingProject: true })}
                  className="mr-text-green-lighter hover:mr-text-white"
                >
                  <FormattedMessage {...messages.cloneChallenge} />
                </button>
              </Fragment>
            )
          }
          
        </li>
      )
    }
  }

  renderDetailBody = () => {
    const challenge = this.props.browsedChallenge;
    switch (this.state.detailTab) {
      case DETAIL_TABS.OVERPASS:
        return (
          <textarea 
            disabled
            className="mr-bg-black-15 mr-w-full mr-p-2 mr-text-sm"
            style={{ height: 500 }}
          >
            {challenge.overpassQL}
          </textarea>
        )
      case DETAIL_TABS.COMMENTS:
        return (
          <ChallengeCommentsPane
            challengeId={this.props}
            osmId={this.props.user?.osmProfile?.id}
            owner={this.props.browsedChallenge?.owner}
          />
        )
      case DETAIL_TABS.OVERVIEW:
      default:
        // Setup saved status and controls based on whether the user has saved this
        // challenge
        let unsaveControl = null;
        let saveControl = null;
        let startControl = null;

        const startableChallenge =
          !challenge.deleted && isUsableChallengeStatus(challenge.status);

        if (_isObject(this.props.user) && !challenge.isVirtual) {
          if (
            _findIndex(this.props.user.savedChallenges, { id: challenge.id }) !== -1
          ) {
            unsaveControl = (
              <Link
                to={{}}
                onClick={() =>
                  this.props.unsaveChallengeForUser(this.props.user.id, challenge.id)
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
                  this.props.saveChallengeForUser(this.props.user.id, challenge.id)
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

        return (
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
                      to={`/review?filters.challengeId=${
                        challenge.id
                      }&filters.challengeName=${encodeURIComponent(
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
      )
    }
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

    let isSaved = false;

    if (_isObject(this.props.user) && !challenge.isVirtual) {
      if (
        _findIndex(this.props.user.savedChallenges, { id: challenge.id }) !== -1
      ) {
        isSaved = true;
      }
    }

    const dataOriginDateText = !challenge.dataOriginDate
      ? null
      : this.props.intl.formatMessage(messages.dataOriginDateLabel, {
          refreshDate: this.props.intl.formatDate(
            parseISO(challenge.lastTaskRefresh)
          ),
          sourceDate: this.props.intl.formatDate(
            parseISO(challenge.dataOriginDate)
          ),
        });

        const showMarkerPopup = (markerData) => {
          return (
           <Popup>
            <TaskChallengeMarkerContent
              marker={markerData}
              taskId={markerData.options.taskId}
              {...this.props}/>
           </Popup>
          )
        }

    const virtualChallengeMapOverlay =
    this.state.selectedClusters.length > 0 ?
    <StartVirtualChallenge
      {...this.props}
      selectedClusters={this.state.selectedClusters}
    /> :
    null

    const map = (
      <ClusterMap
        className="split-pane"
        onTaskClick={(taskId) =>
          this.props.startChallengeWithTask(challenge.id, false, taskId)
        }
        showMarkerPopup={showMarkerPopup}
        challenge={challenge}
        allowClusterToggle
        criteria={{
          boundingBox: fromLatLngBounds(this.state.bounds),
          zoom: this.state.zoom,
        }}
        updateTaskFilterBounds={(bounds, zoom) =>
          this.setState({ bounds, zoom })
        }
        skipRefreshTasks
        allowSpidering
        selectedClusters={this.state.selectedClusters}
        onBulkClusterSelection={this.onBulkClusterSelection}
        onBulkClusterDeselection={this.onBulkClusterDeselection}
        resetSelectedClusters={this.resetSelectedClusters}
        showTaskCount
        showClusterLasso
        showFitWorld
        externalOverlay={virtualChallengeMapOverlay}
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
                  {FLAGGING_ACTIVE && !this.state.flagLoading && !challenge.isVirtual && this.props.user &&
                    <div title={!this.state.issue ? 'Report challenge' : 'View github issue'} className="mr-flex mr-align-center mr-cursor-pointer" onClick={this.handleFlagClick}>
                      <SvgSymbol sym="flag-icon" viewBox="0 0 20 20" className={`mr-w-4 mr-h-4 mr-fill-current mr-mr-2${this.state.issue ? ' mr-fill-red-light mr-mt-4px' : ''}`} />
                      {this.state.issue &&
                        <div className="mr-text-red-light">
                          <FormattedMessage {...messages.reportedText} />
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

                {_isObject(this.props.user) && challenge.enabled && this.state.pickingProject && (
                  <ProjectPicker
                    {...this.props}
                    currentProjectId={challenge.parent.id}
                    onCancel={this.projectPickerCanceled}
                    onSelectProject={this.cloneToProject}
                  />
                )}

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
                          value={parseISO(challenge.dataOriginDate)}
                          year="numeric"
                          month="long"
                          day="2-digit"
                        />
                      </li>
                      {/* Disable Link tell project leaderboard page is reimplemented */}
                      {/* <li>
                        <Link
                          className="mr-text-green-lighter hover:mr-text-white"
                          to={`/challenge/${challenge.id}/leaderboard`}
                        >
                          <FormattedMessage {...messages.viewLeaderboard} />
                        </Link>
                      </li> */}
                      <div className="mr-mb-3" />
                      {this.renderDetailTabs()}
                    </ol>
                  )}
                  {this.renderDetailBody()}
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
    WithStartChallenge(
      WithBrowsedChallenge(WithCurrentChallenge(injectIntl(ChallengeDetail)))
    )
  )
)
