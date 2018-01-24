import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import { get as _get } from 'lodash'
import { Link } from 'react-router-dom'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import Sidebar from '../../../Sidebar/Sidebar'
import CommentList from '../../../CommentList/CommentList'
import TaskList from '../ManageTasks/TaskList'
import ChallengeOverview from './ChallengeOverview'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import Tabs from '../../../Bulma/Tabs'
import ChallengeMetrics from './ChallengeMetrics'
import './ChallengeDetails.css'


/**
 * ChallengeDetails displays various challenge details and metrics of interest
 * to challenge owners, along with a list of the challenge tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeDetails extends Component {
  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const tabs = {
      "Overview": <ChallengeOverview challenge={this.props.challenge} />,
      "Comments": <CommentList comments={_get(this.props, 'challenge.comments', [])} />,
      "Metrics": <ChallengeMetrics challenge={this.props.challenge} />,
    }

    return (
      <div className="admin__manage challenge-details">
        <div className="challenge-details__header">
          <nav className="breadcrumb challenge-details__breadcrumb" aria-label="breadcrumbs">
            <ul>
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

          <div className="columns challenge-details__controls">
            <div className="column is-narrow challenge-details__controls--control">
              <Link to={`/admin/project/${this.props.challenge.parent.id}/challenge/${this.props.challenge.id}/edit`}>
                Edit
              </Link>
            </div>

            <div className="column is-narrow challenge-details__controls--control">
              <a className='button is-clear'
                onClick={() => this.props.deleteChallenge(this.props.challenge.id)}>
                <SvgSymbol className='icon' sym='trash-icon' viewBox='0 0 20 20' />
              </a>
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

ChallengeDetails.propTypes = {
  project: PropTypes.object,
  challenge: PropTypes.object,
  tasks: PropTypes.array.isRequired,
  loadingTasks: PropTypes.bool.isRequired,
}

export default WithCurrentChallenge(injectIntl(ChallengeDetails), true)
