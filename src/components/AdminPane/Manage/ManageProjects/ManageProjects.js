import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import _omit from 'lodash/omit'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject
       from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithSearchResults
       from '../../../HOCs/WithSearchResults/WithSearchResults'
import WithComboSearchExecution
       from '../../HOCs/WithComboSearchExecution/WithComboSearchExecution'
import SearchBox from '../../../SearchBox/SearchBox'
import { searchProjects } from '../../../../services/Project/Project'
import { searchChallenges } from '../../../../services/Challenge/Challenge'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import ProjectList from '../ProjectList/ProjectList'
import messages from './Messages'
import './ManageProjects.css'

// Setup child components with needed HOCs.
const ProjectAndChallengeSearch =
  WithComboSearchExecution(SearchBox, {
    'adminProjects': searchProjects,
    'adminChallenges': query => searchChallenges(query, false, 1000), // include disabled
  })

/**
 * ManageProjects displays a list of projects, along with some meta info.
 * Clicking on a project routes the user to a ManageChallenges component for
 * that project.
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
              </span>
              {this.props.loadingProjects && <BusySpinner inline />}
            </div>
          </h3>

          {this.props.user.isSuperUser &&
           <button className="button is-green is-outlined new-project"
                   onClick={() => this.props.history.push('/admin/projects/new')}>
             <FormattedMessage {...messages.newProject} />
           </button>
          }
        </div>

        {this.props.projects.length <= 1 &&
         <div className='admin__intro admin__manage__projects__intro'>
           <FormattedMessage {...messages.help} />
         </div>
        }

        {this.props.projects.length > 1 &&
         <ProjectAndChallengeSearch className="admin__manage__projects__searchbox"
                                    placeholder={
                                      this.props.intl.formatMessage(messages.placeholder)
                                    } />
        }

        {this.props.projects.length === 0 ?
         <div className="admin__manage__projects__no-projects">
           <FormattedMessage {...messages.regenerateHomeProject} />
         </div> :
         <div className="scroll-wrapper">
           <ProjectList projects={this.props.filteredProjects || this.props.projects}
                        allManageableProjects={this.props.projects}
                        {..._omit(this.props, ['projects'])} />
         </div>
        }
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
}

ManageProjects.defaultProps = {
  loadingProjects: false,
}

export default
  WithManageableProjects(
    WithSearchResults(
      WithSearchResults(
        WithCurrentProject(  // in case normal user has only 1 project
          injectIntl(ManageProjects), {
            includeChallenges: true,
            includeActivity: true,
            historicalMonths: 2,
            defaultToOnlyProject: true,
            restrictToGivenProjects: true,
          }
        ),
        'adminChallenges',
        'challenges',
        'filteredChallenges'
      ),
      'adminProjects',
      'projects',
      'filteredProjects'
    ),
    true
  )
