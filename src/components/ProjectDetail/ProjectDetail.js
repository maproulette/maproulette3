import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage, FormattedRelative, injectIntl } from 'react-intl'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import parse from 'date-fns/parse'
import messages from './Messages'
import BusySpinner from '../BusySpinner/BusySpinner'
import ChallengeProgress from '../ChallengeProgress/ChallengeProgress'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import AsManager from '../../interactions/User/AsManager'
import WithStartChallenge from '../HOCs/WithStartChallenge/WithStartChallenge'
import WithBrowsedChallenge from '../HOCs/WithBrowsedChallenge/WithBrowsedChallenge'
import WithProject from '../HOCs/WithProject/WithProject'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithComputedMetrics from '../AdminPane/HOCs/WithComputedMetrics/WithComputedMetrics'
import ChallengeResultList from '../ChallengePane/ChallengeResultList/ChallengeResultList'

const ProjectProgress = WithComputedMetrics(ChallengeProgress)

/**
 * ProjectDetail represents a specific project view. It presents an
 * overview of the project and it's challenges.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class ProjectDetail extends Component {
  render() {
    const project = this.props.project
    if (!_isObject(project)) {
      return (
        <div className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-min-h-screen-50 mr-items-center mr-justify-center lg:mr-flex mr-text-center mr-py-8">
          <BusySpinner />
        </div>
      )
    }

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
      <div className="mr-bg-gradient-r-green-dark-blue mr-text-white lg:mr-flex">
        {!this.props.loadingChallenges &&
          <div className="mr-pt-8 mr-pl-8">
            <div
              className="mr-card-challenge__owner mr-text-sm mr-text-yellow mr-uppercase mr-mb-4">
              <FormattedMessage {...messages.challengeCount}
                  values={{count:_get(this.props, 'challenges.length', 0),
                           isVirtual: this.props.project.isVirtual}} />
            </div>
            <ChallengeResultList
               unfilteredChallenges={this.props.challenges}
               excludeProjectId={this.props.project.id}
               {...this.props} />
          </div>
        }
        {this.props.loadingChallenges &&
          <BusySpinner />
        }
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
                        <FormattedMessage
                          {...messages.createdOnLabel}
                        />
                        :
                      </strong>{' '}
                      <FormattedRelative
                        value={parse(project.created)}
                      />
                    </li>
                    <li>
                      <strong className="mr-text-yellow">
                        <FormattedMessage
                          {...messages.modifiedOnLabel}
                        />
                        :
                      </strong>{' '}
                      <FormattedRelative
                        value={parse(project.modified)}
                      />
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

                  <ProjectProgress className="mr-my-4" {...this.props} />

                  <ul className="mr-card-challenge__actions">
                    {manageControl && <li>{manageControl}</li>}
                  </ul>
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
    WithStartChallenge(
      WithBrowsedChallenge(
        injectIntl(ProjectDetail)
      )
    ), {includeChallenges: true}
  )
)
