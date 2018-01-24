import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { omit as _omit } from 'lodash'
import WithSearchExecution from '../../../HOCs/WithSearchExecution/WithSearchExecution'
import SearchBox from '../../../SearchBox/SearchBox'
import { searchProjects } from '../../../../services/Project/Project'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import HelpPopout from '../../../HelpPopout/HelpPopout'
import ProjectList from './ProjectList'
import messages from './Messages'
import './ManageProjects.css'

// Setup child components with needed HOCs.
const ProjectSearch =
  WithSearchExecution(SearchBox, 'adminProjects', searchProjects)

/**
 * ManageProjects displays a list of projects, along with some meta info.
 * Clicking on a project routes the user to a ManageChallenges component
 * for that project.
 *
 * @see See ManageChallenges
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ManageProjects extends Component {
  render() {
    if (!this.props.projects) {
      return <BusySpinner />
    }

    return (
      <div className='admin__manage__projects'>
        <div className='admin__manage--heading level'>
          <h3>
            <div className='level'>
              <span className='heading-name'>
                <FormattedMessage {...messages.header} />
                <HelpPopout>
                  <FormattedMessage {...messages.help} />
                </HelpPopout>
              </span>
              {this.props.loadingProjects && <BusySpinner inline />}
            </div>
          </h3>

          <ProjectSearch placeholder={
                          this.props.intl.formatMessage(messages.placeholder)
                          } />
        </div>

        <div className='admin__intro admin__manage-projects--intro'>
        </div>

        <div className='admin__manage__managed-item-list project-list'>
          <ProjectList projects={this.props.filteredProjects || this.props.projects}
                       {..._omit(this.props, ['projects'])} />
        </div>

      </div>
    )
  }
}

ManageProjects.propTypes = {
  /** All manageable projects */
  projects: PropTypes.array.isRequired,
  /** The projects to be actually be displayed */
  filteredProjects: PropTypes.array,
  /** True if projects are currently being fetched from the server */
  loadingProjects: PropTypes.bool,
  /** The currently selected project, if any */
  selectedProject: PropTypes.object,
}

ManageProjects.defaultProps = {
  loadingProjects: false,
}

export default injectIntl(ManageProjects)
