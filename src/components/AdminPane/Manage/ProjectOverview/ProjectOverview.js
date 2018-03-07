import React, { Component } from 'react'
import { FormattedMessage,
         FormattedDate } from 'react-intl'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import messages from './Messages'
import './ProjectOverview.css'

/**
 * ProjectOverview displays some basic at-a-glance information about a
 * Challenge intended for the challenge owner, such as its creation date,
 * status, and a timeline of recent activity.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class ProjectOverview extends Component {
  render() {
    return (
      <div className="project-overview">
        <div className="project-overview__status status-section">
          <div className="columns">
            <div className="column project-overview__description">
              <MarkdownContent markdown={this.props.project.description} />
            </div>
          </div>

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
