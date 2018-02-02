import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import { Link } from 'react-router-dom'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import ChallengeList from '../ManageChallenges/ChallengeList'
import ProjectOverview from '../ProjectOverview/ProjectOverview'
import Sidebar from '../../../Sidebar/Sidebar'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import Tabs from '../../../Bulma/Tabs'
import ChallengeMetrics from '../ChallengeMetrics/ChallengeMetrics'
import manageMessages from '../Messages'
import messages from './Messages'
import './ViewProject.css'


/**
 * ViewProject displays various project details and metrics of interest
 * to challenge owners, along with a list of child challenges.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ViewProject extends Component {
  render() {
    if (!this.props.project) {
      return <BusySpinner />
    }

    const tabs = {
      "Overview": <ProjectOverview {...this.props} />,
      "Metrics": <ChallengeMetrics challenges={this.props.challenges} />,
    }

    return (
      <div className="admin__manage view-project">
        <div className="admin__manage__header">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <Link to={`/admin/manage/${this.props.project.id}`}>
                  <FormattedMessage {...manageMessages.manageHeader} />
                </Link>
              </li>
              <li className="is-active">
                <a aria-current="page">
                  {_get(this.props, 'project.displayName', this.props.project.name)} 
                  {this.props.loadingProject && <BusySpinner inline />}
                </a>
              </li>
            </ul>
          </nav>

          <div className="columns admin__manage__controls">
            <div className="column is-narrow admin__manage__controls--control">
              <Link to={`/admin/project/${this.props.project.id}/edit`}>
                Edit
              </Link>
            </div>

            <div className="column is-narrow admin__manage__controls--control">
              <a className='button is-clear'
                onClick={() => this.props.deleteProject(this.props.project.id)}>
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
                  Challenges
                  {this.props.loadingChallenges && <BusySpinner inline />}
                </h3>

                <button className="button is-green is-outlined new-challenge"
                        onClick={() => this.props.history.push(
                          `/admin/project/${this.props.project.id}/challenges/new`)}>
                  <FormattedMessage {...messages.addChallengeLabel} />
                </button>
              </div>

              <div className='admin__manage__managed-item-list challenge-list'>
                <ChallengeList hideControls {...this.props} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ViewProject.propTypes = {
  project: PropTypes.object,
  challenges: PropTypes.array,
  loadingProject: PropTypes.bool.isRequired,
  loadingChallenges: PropTypes.bool.isRequired,
}

export default WithCurrentProject(injectIntl(ViewProject), true)
