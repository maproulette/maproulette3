import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _isObject from 'lodash/isObject'
import WithCurrentProject from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithCurrentTask from '../../../HOCs/WithCurrentTask/WithCurrentTask'
import WithTaskReview from '../../HOCs/WithTaskReview/WithTaskReview'
import TaskPane from '../../../TaskPane/TaskPane.js'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'
import './ReviewTask.scss'

// Setup child components with necessary HOCs
const ReviewTaskPane = WithCurrentTask(WithTaskReview(TaskPane))

/**
 * ReviewTask renders a task in review mode for challenge owners who wish to
 * review their tasks.
 *
 * @see See TaskPane
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ReviewTask extends Component {
  render() {
    return (
      <div className="admin__manage review-task">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <Link to='/admin/projects'>
                  <FormattedMessage {...manageMessages.manageHeader} />
                </Link>
              </li>
              <li>
                <Link to={`/admin/project/${this.props.project.id}`}>
                  {this.props.project.displayName ||
                  this.props.project.name}
                </Link>
              </li>
              {_isObject(this.props.challenge) &&
                <li>
                  <Link to={`/admin/project/${this.props.project.id}/challenge/${this.props.challenge.id}`}>
                    {this.props.challenge.name}
                  </Link>
                </li>
              }
              <li className="is-active">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a aria-current="page">
                  <FormattedMessage {...messages.reviewTask} />
                </a>
                {this.props.loading && <BusySpinner inline />}
              </li>
            </ul>
          </nav>
        </div>

        <ReviewTaskPane reviewTask {...this.props} />
      </div>
    )
  }
}

export default WithCurrentProject(
  WithCurrentChallenge(
    WithCurrentTask(injectIntl(ReviewTask))
  )
)
