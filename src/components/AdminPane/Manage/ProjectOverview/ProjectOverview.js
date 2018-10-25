import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage,
         FormattedDate } from 'react-intl'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import messages from './Messages'
import './ProjectOverview.css'

/**
 * ProjectOverview displays some basic at-a-glance information about a Project
 * intended for the project owner, such as its creation date and
 * last-modified date, as well an option to Delete the project.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProjectOverview extends Component {
  deleteProject = () => {
    this.props.deleteProject(this.props.project.id,
                             this.props.managesSingleProject)
    this.props.history.replace("/admin/projects")
  }

  render() {
    return (
      <div className="project-overview">
        <div className="project-overview__status status-section">
          {!this.props.suppressDescription &&
           <div className="columns">
             <div className="column project-overview__description">
               <MarkdownContent markdown={this.props.project.description} />
             </div>
           </div>
          }

          <div className="columns">
            <div className="column is-one-quarter status-label">
              <FormattedMessage {...messages.creationDate} />
            </div>

            <div className="column is-narrow">
              <FormattedDate value={new Date(this.props.project.created)}
                            year='numeric'
                            month='long'
                            day='2-digit' />
            </div>
          </div>

          <div className="columns">
            <div className="column is-one-quarter status-label">
              <FormattedMessage {...messages.lastModifiedDate} />
            </div>

            <div className="column is-narrow">
              <FormattedDate value={new Date(this.props.project.modified)}
                             year='numeric'
                             month='long'
                             day='2-digit' />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProjectOverview.propTypes = {
  /** The project for which the overview is to be displayed */
  project: PropTypes.object,
  /** Set to true if the user manages only a single project */
  managesSingleProject: PropTypes.bool.isRequired,
  /** Invoked if the user wishes to delete the project */
  deleteProject: PropTypes.func.isRequired,
  /** Set to true to suppress display of project description */
  suppressDescription: PropTypes.bool,
}
