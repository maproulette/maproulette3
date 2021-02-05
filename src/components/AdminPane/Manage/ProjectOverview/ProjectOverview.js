import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage,
         FormattedDate } from 'react-intl'
import MarkdownContent from '../../../MarkdownContent/MarkdownContent'
import ConfirmAction from '../../../ConfirmAction/ConfirmAction'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import AsManager from '../../../../interactions/User/AsManager'
import messages from './Messages'

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
    const manager = AsManager(this.props.user)

    return (
      <div>
        <div>
          {!this.props.suppressDescription &&
           <div>
             <div>
               <MarkdownContent markdown={this.props.project.description} />
             </div>
           </div>
          }

          <div className="mr-text-base mr-mt-4">
            <div className="mr-flex mr-items-center">
              <div className="mr-text-yellow mr-mr-2">
                <FormattedMessage {...messages.creationDate} />
              </div>

              <div>
                <FormattedDate
                  value={new Date(this.props.project.created)}
                  year='numeric'
                  month='long'
                  day='2-digit'
                />
              </div>
            </div>

            <div className="mr-flex mr-items-center">
              <div className="mr-text-yellow mr-mr-2">
                <FormattedMessage {...messages.lastModifiedDate} />
              </div>

              <div>
                <FormattedDate
                  value={new Date(this.props.project.modified)}
                  year='numeric'
                  month='long'
                  day='2-digit'
                />
              </div>
            </div>

            <div className="mr-flex mr-items-center mr-mt-4">
              <div className="mr-text-yellow mr-mr-2">
                <FormattedMessage {...messages.visibleLabel} />
              </div>

              <div>
                <ConfirmAction
                  prompt={<FormattedMessage {...messages.confirmDisablePrompt} />}
                  skipConfirmation={() => !this.props.project.enabled}
                >
                  <div
                    className="visibility-switch"
                    onClick={() => this.props.toggleProjectEnabled(this.props.project)}
                  >
                    <input
                      type="checkbox"
                      className="switch is-rounded short-and-wide"
                      disabled={!manager.canWriteProject(this.props.project)}
                      checked={this.props.project.enabled}
                      onChange={() => null}
                    />
                    <label />
                  </div>
                </ConfirmAction>
              </div>
            </div>
          </div>
          {!this.props.project.enabled &&
            <div className="mr-text-red-light mr-flex mr-items-center mr-text-base mr-uppercase mr-mt-2">
              <a
                href={`${process.env.REACT_APP_DOCS_URL}/documentation/challenge-visibility-and-discovery/`}
                className="mr-mr-2 mr-flex mr-items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SvgSymbol
                  sym="info-icon"
                  viewBox="0 0 40 40"
                  className="mr-fill-red-light mr-w-6 mr-w-6"
                />
              </a>
              <FormattedMessage {...messages.challengesUndiscoverable} />
            </div>
          }
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
  /** Invoked if the user wishes to change project visibility */
  toggleProjectEnabled: PropTypes.func.isRequired,
  /** Set to true to suppress display of project description */
  suppressDescription: PropTypes.bool,
}
