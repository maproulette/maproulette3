import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import AsManager from '../../../../interactions/User/AsManager'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import Sidebar from '../../../Sidebar/Sidebar'
import DropdownButton from '../../../Bulma/DropdownButton'
import ChallengeComments from '../ChallengeComments/ChallengeComments'
import ChallengeOverview from '../ManageChallenges/ChallengeOverview'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import Tabs from '../../../Bulma/Tabs'
import ChallengeMetrics from '../ChallengeMetrics/ChallengeMetrics'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import ViewChallengeTasks from './ViewChallengeTasks'
import manageMessages from '../Messages'
import messages from './Messages'
import './ViewChallenge.css'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * ViewChallenge displays various challenge details and metrics of interest to
 * challenge owners, along with the challenge tasks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewChallenge extends Component {
  deleteChallenge = () => {
    this.props.deleteChallenge(this.props.challenge.parent.id,
                               this.props.challenge.id)
  }

  rebuildChallenge = () => {
    this.props.rebuildChallenge(this.props.challenge.id)
  }

  moveChallenge = action => {
    this.props.moveChallenge(this.props.challenge.id, action.projectId)
  }

  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const manager = AsManager(this.props.user)

    const projectId = _get(this.props, 'challenge.parent.id')

    const managedProjectOptions = _compact(_map(this.props.projects, project => {
      if (project.id === projectId) {
        return null
      }

      return {
        key: `project-${project.id}`,
        text: project.displayName ? project.displayName : project.name,
        projectId: project.id,
      }
    }))

    const tabs = {
      [this.props.intl.formatMessage(messages.challengeOverviewTabLabel)]:
        <ChallengeOverview {...this.props} />,

      [this.props.intl.formatMessage(messages.challengeCommentsTabLabel)]:
        <ChallengeComments challenge={this.props.challenge} />,

      [this.props.intl.formatMessage(messages.challengeMetricsTabLabel)]:
        <ChallengeMetrics challenges={[this.props.challenge]}
                          calendarMonths={6}
                          highContrastCalendar
                          completionHeight={350} />,
    }

    return (
      <div className="admin__manage view-challenge">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <Link to='/admin/projects'>
                  <FormattedMessage {...manageMessages.manageHeader} />
                </Link>
              </li>
              <li>
                <Link to={`/admin/project/${projectId}`}>
                  {_get(this.props, 'challenge.parent.displayName') ||
                   _get(this.props, 'challenge.parent.name')}
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

          {manager.canWriteProject(this.props.challenge.parent) &&
           <div className="columns admin__manage__controls">
             <div className="column is-narrow admin__manage__controls--control">
               <Link to={`/admin/project/${projectId}/` +
                         `challenge/${this.props.challenge.id}/edit`}>
                 <FormattedMessage {...messages.editChallengeLabel } />
               </Link>
             </div>

             {_get(this.props, 'projects.length', 0) > 1 &&
              <div className="column is-narrow admin__manage__controls--control">
                <DeactivatableDropdownButton options={managedProjectOptions}
                                             onSelect={this.moveChallenge}>
                  <a>
                    <FormattedMessage {...messages.moveChallengeLabel} />
                    <div className="basic-dropdown-indicator" />
                  </a>
                </DeactivatableDropdownButton>
              </div>
             }

             {this.props.challenge.isRebuildable() &&
              <div className="column is-narrow admin__manage__controls--control">
                <ConfirmAction prompt={<FormattedMessage {...messages.rebuildChallengePrompt} />}>
                  <a onClick={this.rebuildChallenge}>
                    <FormattedMessage {...messages.rebuildChallengeLabel } />
                  </a>
                </ConfirmAction>
              </div>
             }

             <div className="column is-narrow admin__manage__controls--control">
               <Link to={{pathname: `/admin/project/${projectId}/` +
                                    `challenge/${this.props.challenge.id}/clone`,
                          state: {cloneChallenge: true}}}>
                 <FormattedMessage {...messages.cloneChallengeLabel } />
               </Link>
             </div>

             <div className="column is-narrow admin__manage__controls--control">
               <ConfirmAction>
                 <a className='button is-clear' onClick={this.deleteChallenge}>
                   <SvgSymbol sym='trash-icon' className='icon' viewBox='0 0 20 20' />
                 </a>
               </ConfirmAction>
             </div>
           </div>
          }
        </div>

        <div className="admin__manage__pane-wrapper">
          <Sidebar className='admin__manage__sidebar inline' isActive={true}>
            <Tabs className='is-centered' tabs={tabs} />
          </Sidebar>

          <div className="admin__manage__primary-content">
            <ViewChallengeTasks {...this.props} />
          </div>
        </div>
      </div>
    )
  }
}

ViewChallenge.propTypes = {
  /** The parent project of the challenge */
  project: PropTypes.object,
  /** The current challenge to view */
  challenge: PropTypes.object,
  /** Set to true if challenge data is still loading */
  loadingChallenge: PropTypes.bool.isRequired,
  /** Invoked when the user wishes to delete the challenge */
  deleteChallenge: PropTypes.func.isRequired,
  /** Invoked when the user wishes to move the challenge */
  moveChallenge: PropTypes.func.isRequired,
}

export default WithManageableProjects(
  WithCurrentProject(
    WithCurrentChallenge(
      WithFilteredClusteredTasks(
        injectIntl(ViewChallenge),
        'clusteredTasks',
        'filteredClusteredTasks',
      ),
      true
    )
  )
)
