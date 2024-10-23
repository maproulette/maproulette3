import { Component } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { FormattedMessage, FormattedDate, injectIntl }
       from 'react-intl'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import { parseISO } from 'date-fns'
import messages from './Messages'
import BusySpinner from '../BusySpinner/BusySpinner'
import ChallengeProgress from '../ChallengeProgress/ChallengeProgress'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import AsManager from '../../interactions/User/AsManager'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import WithBrowsedChallenge from '../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithProject from '../HOCs/WithProject/WithProject'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import ProjectFilterSubnav from '../ChallengePane/ChallengeFilterSubnav/ProjectFilterSubnav'
import WithFilteredChallenges from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithChallengeSearch from '../HOCs/WithSearch/WithChallengeSearch'
import WithComputedMetrics from '../AdminPane/HOCs/WithComputedMetrics/WithComputedMetrics'
import ChallengeResultList from '../ChallengePane/ChallengeResultList/ChallengeResultList'
import { PROJECT_CHALLENGE_LIMIT } from '../../services/Project/Project'
import { isUsableChallengeStatus } from '../../services/Challenge/ChallengeStatus/ChallengeStatus'

const ProjectProgress = WithComputedMetrics(ChallengeProgress)

/**
 * ProjectDetail represents a specific project view. It presents an
 * overview of the project and it's challenges.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ProjectDetail extends Component {
  state = {
    remainingChallengeOnly: true
  }

  render() {
    const { project, owner } = this.props;
    if (!_isObject(project) || !_isObject(owner)) {
      return (
        <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-min-h-screen-50 mr-items-center mr-justify-center lg:mr-flex mr-text-center mr-py-8">
          <BusySpinner />
        </div>
      )
    }
    const challengeResults = _filter(this.props.challenges, (challenge) => {
      return (isUsableChallengeStatus(challenge.status))
    })

    // Does this user own (or can manage) the current project?
    const isManageable = AsManager(this.props.user).canManage(project)

    const manageControl = !isManageable ? null : (
      <Link
        to={`/admin/project/${project.id}`}
        className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
      >
        <FormattedMessage {...messages.manageLabel} />
      </Link>
    )

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white">
        <ProjectFilterSubnav {...this.props} />
        <div className="mr-bg-gradient-r-green-dark-blue mr-text-white lg:mr-flex">
          {!this.props.loadingChallenges &&
            <div className="mr-pt-8 mr-pl-8">
              <div className="mr-flex mr-mb-4">
                <div className="mr-text-sm mr-text-yellow mr-uppercase mr-my-auto">
                  <FormattedMessage
                    {...messages.challengeCount}
                    values={{
                      count: challengeResults.length,
                      isVirtual: this.props.project.isVirtual
                    }}
                  />
                </div>
                <div className="mr-my-auto">
                  <input
                    type="checkbox"
                    className="mr-checkbox-toggle mr-ml-4"
                    checked={!this.state.remainingChallengeOnly}
                    onChange={() => this.setState({ remainingChallengeOnly: !this.state.remainingChallengeOnly })}
                  />
                  <label className="mr-text-white mr-ml-1 mr-text-sm"><FormattedMessage {...messages.showAll} /></label>
                </div>
              </div>
              <ChallengeResultList
                unfilteredChallenges={this.props.challenges}
                excludeProjectResults
                excludeProjectId={this.props.project.id}
                remainingChallengeOnly={this.state.remainingChallengeOnly}
                {...this.props}
              />
            </div>
          }
          {this.props.loadingChallenges && <BusySpinner />}
          <div className="mr-flex-1">
            <div className="mr-h-content mr-overflow-auto">
              <div className="mr-max-w-md mr-mx-auto">
                <div className="mr-pt-6 mr-px-8">
                  <div className="mr-mb-4">
                    <button
                      className="mr-text-green-lighter mr-text-sm hover:mr-text-white"
                      onClick={() => this.props.history.goBack()}
                    >
                      &larr; <FormattedMessage {...messages.goBack} />
                    </button>
                  </div>

                  <h1 className="mr-card-challenge__title">{project.displayName}</h1>
                  <div className="mr-card-challenge__content">
                    <ol className="mr-card-challenge__meta">
                      <li>
                        <strong className="mr-text-yellow">
                          <FormattedMessage {...messages.ownerLabel} />:
                        </strong>{' '}
                        <a
                          className="mr-text-green-lighter hover:mr-text-white"
                          href={import.meta.env.REACT_APP_OSM_SERVER + '/user/' + owner.osmProfile.displayName}
                          target="_blank"
                          rel="noopener"
                        >
                          {owner.osmProfile.displayName}
                        </a>
                      </li>
                      <li>
                        <strong className="mr-text-yellow">
                          <FormattedMessage {...messages.createdOnLabel} />:
                        </strong>{' '}
                        <FormattedDate value={parseISO(project.created)}
                                        year='numeric' month='long' day='2-digit' />
                      </li>
                      <li>
                        <strong className="mr-text-yellow">
                          <FormattedMessage {...messages.modifiedOnLabel} />:
                        </strong>{' '}
                        <FormattedDate value={parseISO(project.modified)}
                                        year='numeric' month='long' day='2-digit' />
                      </li>
                      {_get(this.props, 'challenges.length', 0) > 0 &&
                        <li>
                          <Link
                            className="mr-text-green-lighter hover:mr-text-white"
                            to={`/project/${project.id}/leaderboard`}
                          >
                            <FormattedMessage {...messages.viewLeaderboard} />
                          </Link>
                        </li>
                      }
                    </ol>

                    <div className="mr-card-challenge__description">
                      <MarkdownContent
                        markdown={project.description}
                      />
                    </div>

                    {this.props.challenges?.length > PROJECT_CHALLENGE_LIMIT 
                      ?  <div className="mr-text-red">
                          Sorry, project statistics are not available for projects with more than {PROJECT_CHALLENGE_LIMIT} challenges.
                        </div>
                      :  <ProjectProgress className="mr-my-4" {...this.props} />}
                  

                    <ul className="mr-card-challenge__actions mr-mt-4 mr-leading-none mr-text-base">
                      <li>
                        {_get(this.props.user, 'settings.isReviewer') &&
                          <Link
                            className={classNames(
                              "mr-text-green-lighter hover:mr-text-white mr-mr-4",
                              {"mr-border-r-2 mr-border-white-10 mr-pr-4 mr-mr-4": manageControl})}
                            to={`/review?projectId=${project.id}&projectName=${project.displayName}`}
                          >
                            <FormattedMessage {...messages.viewReviews} />
                          </Link>
                        }
                        {manageControl}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WithCurrentUser(
  WithProject(
    WithChallengeSearch(
      WithFilteredChallenges(
        WithStartChallenge(
          WithBrowsedChallenge(
            injectIntl(ProjectDetail)
          )
        )
      )
    ), {includeChallenges: true, includeOwner: true}
  )
)
