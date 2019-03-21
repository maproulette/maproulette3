import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _isObject from 'lodash/isObject'
import WithCurrentProject from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithCurrentTask from '../../../HOCs/WithCurrentTask/WithCurrentTask'
import WithTaskInspect from '../../HOCs/WithTaskInspect/WithTaskInspect'
import TaskPane from '../../../TaskPane/TaskPane.js'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'
import './InspectTask.scss'

// Setup child components with necessary HOCs
const InspectTaskPane = WithCurrentTask(WithTaskInspect(TaskPane))

/**
 * InspectTask renders a task in inspect mode for challenge owners who wish to
 * inspect their tasks.
 *
 * @see See TaskPane
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class InspectTask extends Component {
  render() {
    return (
      <div className="admin__manage inspect-task">
        {this.props.project &&
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
                    <FormattedMessage {...messages.inspectTask} />
                  </a>
                  {this.props.loading && <BusySpinner inline />}
                </li>
              </ul>
            </nav>
          </div>
        }

        <InspectTaskPane inspectTask {...this.props} />
      </div>
    )
  }
}

export default WithCurrentProject(
  WithCurrentChallenge(
    WithCurrentTask(injectIntl(InspectTask))
  )
)
