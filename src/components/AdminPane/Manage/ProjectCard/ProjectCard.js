import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import _omit from 'lodash/omit'
import AsManager from '../../../../interactions/User/AsManager'
import AsManageableProject
       from '../../../../interactions/Project/AsManageableProject'
import Tabs from '../../../Bulma/Tabs'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import ProjectOverview from '../ProjectOverview/ProjectOverview'
import ProjectManagers from '../ProjectManagers/ProjectManagers'
import ChallengeList from '../ChallengeList/ChallengeList'
import messages from './Messages'
import './ProjectCard.css'

export class ProjectCard extends Component {
  render() {
    if (!this.props.project) {
      return null
    }

    const manager = AsManager(this.props.user)
    const project = AsManageableProject(this.props.project)

    const projectNameColumn = (
      <div className="column item-link project-list-item__project-name is-active">
        <div className="level">
          <Link to={`/admin/project/${project.id}`}>
            {project.displayName || project.name}
          </Link>
          {this.props.isExpanded && this.props.loadingChallenges && <BusySpinner inline />}
        </div>
      </div>
    )

    let projectBody = null
    if (this.props.showPreview) {
      const matchingChallenges = project.childChallenges(this.props.filteredChallenges)
      projectBody = matchingChallenges.length === 0 ? null : (
        <div className="project-card__project-challenge-preview">
          <div className="project-card__project-challenge-preview__header">
            <FormattedMessage {...messages.challengePreviewHeader} />
          </div>

          <ChallengeList challenges={matchingChallenges} suppressControls
                         {..._omit(this.props, 'challenges')} />
        </div>
      )
    }
    else if (this.props.isExpanded) {
      const tabs = {
        [this.props.intl.formatMessage(messages.challengesTabLabel)]:
          <ChallengeList challenges={project.childChallenges(this.props.challenges)}
                         suppressControls={!manager.canWriteProject(project)}
                         {..._omit(this.props, 'challenges')} />,
        [this.props.intl.formatMessage(messages.detailsTabLabel)]:
          <ProjectOverview {...this.props} />,
        [this.props.intl.formatMessage(messages.managersTabLabel)]:
          <ProjectManagers {...this.props} />,
      }

      projectBody = (
        <div className='project-card__project-content'>
          <Tabs className='is-centered' tabs={tabs} />
        </div>
      )
    }

    return (
      <div className={classNames('project-card item-entry',
                                 {'is-active': this.props.isExpanded})}>
        <div className='columns list-item project-list-item'>
          <div className='column is-narrow item-visibility'
              title={project.enabled ?
                      this.props.intl.formatMessage(messages.enabledTooltip) :
                      this.props.intl.formatMessage(messages.disabledTooltip)}>
            <SvgSymbol className={classNames('icon', {enabled: project.enabled})}
                      viewBox='0 0 20 20'
                      sym={project.enabled ? 'visible-icon' : 'hidden-icon'} />
          </div>

          {projectNameColumn}

          {manager.canWriteProject(project) &&
            <div className='column is-narrow has-text-right controls edit-control'>
              <Link to={`/admin/project/${project.id}/edit`}
                    title={this.props.intl.formatMessage(messages.editProjectTooltip)}>
                <FormattedMessage {...messages.editProjectLabel} />
              </Link>
            </div>
          }

          <div className='column is-narrow item-pinned'>
            <div className="clickable" onClick={() => this.props.toggleProjectPin(project.id)}>
              <SvgSymbol className={classNames('icon', {enabled: this.props.isPinned})}
                         viewBox='0 0 20 20'
                         sym='pin-icon' />
            </div>
          </div>
        </div>

        {projectBody}
      </div>
    )
  }
}

ProjectCard.propTypes = {
  user: PropTypes.object.isRequired,
  project: PropTypes.object,
  isExpanded: PropTypes.bool,
  showPreview: PropTypes.bool,
  loadingChallenges: PropTypes.bool,
  challenges: PropTypes.array,
  filteredChallenges: PropTypes.array,
}

ProjectCard.defaultProps = {
  isExpanded: false,
  showPreview: false,
  loadingChallenges: false,
}

export default injectIntl(ProjectCard)
