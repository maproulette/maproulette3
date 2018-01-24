import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { searchChallenges } from '../../../../services/Challenge/Challenge'
import WithSearchResults from '../../../HOCs/WithSearchResults/WithSearchResults'
import WithSearchExecution from '../../../HOCs/WithSearchExecution/WithSearchExecution'
import SearchBox from '../../../SearchBox/SearchBox'
import BusySpinner from '../../../BusySpinner/BusySpinner'
import HelpPopout from '../../../HelpPopout/HelpPopout'
import ChallengeList from './ChallengeList'
import messages from './Messages'
import './ManageChallenges.css'

// Setup child components with needed HOCs.
const ChallengeSearch =
  WithSearchExecution(SearchBox, 'adminChallenges', searchChallenges)

/**
 * ManageChallenges displays a list of project challenges, along with some meta
 * info.  Clicking on a project routes the user to a ManageTasks component for
 * that challenge.
 *
 * @see See ManageTasks
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
class ManageChallenges extends Component {
  render() {
    return (
      <div className='admin__manage-challenges'>
        <div className='admin__manage--heading level'>
          <h3>
            <div className='level'>
              <FormattedMessage {...messages.header} /> <HelpPopout>
                <FormattedMessage {...messages.intro} />
              </HelpPopout>
              {this.props.loadingChallenges && <BusySpinner inline />}
            </div>
          </h3>
          <ChallengeSearch placeholder={
                            this.props.intl.formatMessage(messages.placeholder)
                          } />
        </div>

        <div className='parent-project-name'>
          {this.props.selectedProject ? this.props.selectedProject.displayName :
            <FormattedMessage {...messages.allProjectChallenge} />
          }
        </div>

        <div className='admin__manage__managed-item-list challenge-list'>
          <ChallengeList {...this.props} />
        </div>
      </div>
    )
  }
}

ManageChallenges.propTypes = {
  /** The challenges to be displayed and managed */
  challenges: PropTypes.array.isRequired,
  /** True if challenges are currently being fetched from the server */
  loadingChallenges: PropTypes.bool,
  /** The currently selected project, if any */
  selectedProject: PropTypes.object,
}

ManageChallenges.defaultProps = {
  loadingChallenges: false,
}

export default WithSearchResults(
  injectIntl(ManageChallenges),
  'adminChallenges',
  'challenges'
)
