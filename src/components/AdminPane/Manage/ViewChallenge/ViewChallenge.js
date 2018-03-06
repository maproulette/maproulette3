import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import WithCurrentChallenge
       from '../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithFilteredClusteredTasks
       from '../../HOCs/WithFilteredClusteredTasks/WithFilteredClusteredTasks'
import Sidebar from '../../../Sidebar/Sidebar'
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

  render() {
    if (!this.props.challenge) {
      return <BusySpinner />
    }

    const tabs = {
      [this.props.intl.formatMessage(messages.challengeOverviewTabLabel)]:
        <ChallengeOverview challenge={this.props.challenge} />,

      [this.props.intl.formatMessage(messages.challengeCommentsTabLabel)]:
        <ChallengeComments challenge={this.props.challenge} />,

      [this.props.intl.formatMessage(messages.challengeMetricsTabLabel)]:
        <ChallengeMetrics challenges={[this.props.challenge]} />,
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
              <Link to={`/admin/project/${this.props.challenge.parent.id}/` +
                        `challenge/${this.props.challenge.id}/edit`}>
                <FormattedMessage {...messages.editChallengeLabel } />
              </Link>
            </div>

            <div className="column is-narrow admin__manage__controls--control">
              <Link to={{pathname: `/admin/project/${this.props.challenge.parent.id}/` +
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
  /** Invoked to signal the user wishes to delete the challenge */
  deleteChallenge: PropTypes.func.isRequired,
}

export default WithCurrentChallenge(
  WithFilteredClusteredTasks(
    injectIntl(ViewChallenge),
    'clusteredTasks',
    'filteredClusteredTasks',
  ),
  true
)
