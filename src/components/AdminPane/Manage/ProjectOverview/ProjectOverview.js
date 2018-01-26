import React, { Component } from 'react'
import { FormattedMessage,
         FormattedDate } from 'react-intl'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import messages from './Messages'

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
        <section className="project-overview__description">
          <MarkdownContent markdown={this.props.project.description} />
        </section>

        <section className="project-overview__status">
          <div className="columns">
            <div className="column is-narrow status-label">
              <FormattedMessage {...messages.creationDate} />
            </div>

            <div className="column is-narrow">
              <FormattedDate value={new Date(this.props.project.created)}
                             year='numeric'
                             month='long'
                             day='2-digit' />
            </div>
          </div>
        </section>
      </div>
    )
  }
}
