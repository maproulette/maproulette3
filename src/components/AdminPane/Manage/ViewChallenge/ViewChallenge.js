import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import { Link } from 'react-router-dom'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import Sidebar from '../../../Sidebar/Sidebar'
import CommentList from '../../../CommentList/CommentList'
import TaskList from '../ManageTasks/TaskList'
import ChallengeOverview from '../ManageChallenges/ChallengeOverview'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import Tabs from '../../../Bulma/Tabs'
import ChallengeMetrics from '../ChallengeMetrics/ChallengeMetrics'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import manageMessages from '../Messages'
import './ViewChallenge.css'


/**
 * ViewChallenge displays various challenge details and metrics of interest
 * to challenge owners, along with a list of the challenge tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewChallenge extends Component {
  deleteChallenge = () => {
    this.props.deleteChallenge(this.props.challenge.parent.id,
                               this.props.challenge.id)
  }

  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const tabs = {
      "Overview": <ChallengeOverview challenge={this.props.challenge} />,
      "Comments": <CommentList includeTaskLinks
                               comments={_get(this.props, 'challenge.comments', [])} />,
      "Metrics": <ChallengeMetrics challenges={[this.props.challenge]} />,
    }

    return (
      <div className="admin__manage view-challenge">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <Link to={`/admin/manage/${this.props.challenge.parent.id}`}>
                  <FormattedMessage {...manageMessages.manageHeader} />
                </Link>
              </li>
              <li>
                <Link to={`/admin/project/${this.props.challenge.parent.id}`}>
                  {this.props.challenge.parent.displayName ||
                  this.props.challenge.parent.name}
                </Link>
              </li>
              <li className="is-active">
                <a aria-current="page">
                  {this.props.challenge.name}
                  {this.props.loadingChallenge && <BusySpinner inline />}
                </a>
              </li>
            </ul>
          </nav>

          <div className="columns admin__manage__controls">
            <div className="column is-narrow admin__manage__controls--control">
              <Link to={`/admin/project/${this.props.challenge.parent.id}/challenge/${this.props.challenge.id}/edit`}>
                Edit
              </Link>
            </div>

            <div className="column is-narrow admin__manage__controls--control">
              <ConfirmAction>
                <a className='button is-clear' onClick={this.deleteChallenge}>
                  <SvgSymbol className='icon' sym='trash-icon' viewBox='0 0 20 20' />
                </a>
              </ConfirmAction>
            </div>
          </div>
        </div>

        <div className="admin__manage__pane-wrapper">
          <Sidebar className='admin__manage__sidebar inline' isActive={true}>
            <Tabs className='is-centered' tabs={tabs} />
          </Sidebar>

          <div className="admin__manage__primary-content">
            <div className='admin__manage-tasks'>
              <div className='level admin__manage--heading'>
                <h3>
                  Tasks
                  {this.props.loadingTasks && <BusySpinner inline />}
                </h3>
              </div>

              <div className='admin__manage__managed-item-list'>
                <TaskList {...this.props} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ViewChallenge.propTypes = {
  project: PropTypes.object,
  challenge: PropTypes.object,
  tasks: PropTypes.array.isRequired,
  loadingTasks: PropTypes.bool.isRequired,
}

export default WithCurrentChallenge(injectIntl(ViewChallenge), true)
