import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _sum from 'lodash/sum'
import WithCurrentProject from '../../HOCs/WithCurrentProject/WithCurrentProject'
import ChallengeMetrics from '../ChallengeMetrics/ChallengeMetrics'
import ChallengeAnalysisTable
       from '../ChallengeAnalysisTable/ChallengeAnalysisTable'
import messages from './Messages'
import './ProjectMetrics.css'

/**
 * ProjectMetrics displays various high-level metrics about the given projects
 * and challenges.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ProjectMetrics extends Component {
  render() {
    const projectCount = _get(this.props, 'projects.length', 0)
    const challengeCount = _get(this.props, 'challenges.length', 0)
    const taskCount = _sum(_map(this.props.challenges, 'actions.total')) || 0

    return (
      <div className="project-metrics">
        <div className="project-metrics__header">
          <FormattedMessage {...messages.header} />
        </div>

        <div className="project-metrics__counts">
          {!this.props.project &&
          <div className="project-metrics__counts__projects-count">
            <span className="count">
              <FormattedNumber value={projectCount} />
            </span> <FormattedMessage {...messages.projects}
                                      values={{count: projectCount}} />
          </div>
          }

          {this.props.project &&
          <div className="project-metrics__counts__challenges-count">
            <span className="count">
              <FormattedNumber value={challengeCount} />
            </span> <FormattedMessage {...messages.challenges}
                                      values={{count: challengeCount}} />
          </div>
          }

          {this.props.project &&
          <div className="project-metrics__counts__tasks-count">
            <span className="count">
              <FormattedNumber value={taskCount} />
            </span> <FormattedMessage {...messages.tasks}
                                      values={{count: taskCount}} />
          </div>
          }
        </div>

        {this.props.project &&
         <div>
           <ChallengeAnalysisTable {...this.props} />

           <div className="project-metrics__stats">
             <ChallengeMetrics burndownHeight={400}
                               activity={_get(this.props, 'project.activity', [])}
                               {...this.props} />
           </div>
        </div>
        }
      </div>
    )
  }
}

ProjectMetrics.propTypes = {
  projects: PropTypes.array,
  challenges: PropTypes.array,
}

export default
  WithCurrentProject(ProjectMetrics, {
    includeChallenges: true,
    includeActivity: true,
    historicalMonths: 2,
    defaultToOnlyProject: true,
    restrictToGivenProjects: true,
  })
