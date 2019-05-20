import React, { Component } from 'react'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _omit from 'lodash/omit'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WithSearchResults from '../../../HOCs/WithSearchResults/WithSearchResults'
import WithChallenges from '../../../HOCs/WithChallenges/WithChallenges'
import { extendedFind } from '../../../../services/Challenge/Challenge'
import SearchBox from '../../../SearchBox/SearchBox'
import AssociatedChallengeList from './AssociatedChallengeList'
import QuickWidget from '../../../QuickWidget/QuickWidget'
import Header from '../../../Header/Header'
import Button from '../../../Button/Button'

import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'

// Setup child components with needed HOCs.
const ChallengeSearch = WithSearch(
  SearchBox,
  'adminChallengeList',
  searchCriteria =>
    extendedFind({searchQuery: searchCriteria.query, onlyEnabled: false}, 1000),
)

const ChallengeSearchResults =
  WithChallenges(
    WithSearchResults(AssociatedChallengeList,
                      'adminChallengeList', 'challenges')
  )


/**
 * Allows adding and removing challenges from the virtual project challenge list.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class manageChallengeList extends Component {
  addChallenge(challengeId, projectId, props) {
    props.addChallenge(challengeId, projectId)
  }

  removeChallenge(challengeId, projectId, props) {
    props.removeChallenge(challengeId, projectId)
  }

  done(props) {
    props.history.push(`/admin/project/${props.project.id}`)
  }

  render() {
    const searchControl = this.props.projects.length === 0 ? null : (
      <ChallengeSearch className="challenge-list-widget__searchbox"
                       inputClassName="mr-text-blue mr-border-b mr-border-blue"
                       placeholder={"search...."} />
    )

    const projectId = _get(this.props, 'project.id')

    const doneButton =
      <Button onClick={() => this.done(this.props)}>
        <FormattedMessage {...messages.doneLabel} />
      </Button>

    const breadcrumbs =
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li>
            <Link to='/admin/projects'>
              <FormattedMessage {...manageMessages.manageHeader} />
            </Link>
          </li>
          {_isObject(this.props.project) &&
          <li>
            <Link to={`/admin/project/${this.props.project.id}`}>
              {_get(this.props, 'project.displayName', this.props.project.name)}
            </Link>
          </li>
          }
          <li className="is-active">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a aria-current="page">
              <FormattedMessage {...messages.manageChallengesLabel} />
            </a>
            {this.props.loadingProject && <BusySpinner inline />}
          </li>
        </ul>
      </nav>

    return (
      <div className="admin__manage edit-project">
        <Header
          className="mr-px-8"
          eyebrow={breadcrumbs}
          actions={doneButton}
        />

        <div className="md:mr-grid md:mr-grid-gap-8 md:mr-grid-columns-2">
          <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-mt-8 mr-p-4 md:mr-p-8 mr-rounded">
            <QuickWidget {...this.props}
                        className="challenge-list-widget"
                        widgetTitle={this.props.intl.formatMessage(messages.findChallengesLabel)}
                        headerControls={searchControl}>
              <ChallengeSearchResults {..._omit(this.props, 'challenges')} toBeAdded
                addChallenge={(challengeId) => this.addChallenge(challengeId, projectId, this.props)}
                challenges={this.props.filteredChallenges}
                excludeChallenges={this.props.challenges}
                allStatuses={true} />
            </QuickWidget>
          </div>
          <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-mt-8 mr-p-4 md:mr-p-8 mr-rounded mr-w-full">
            <QuickWidget {...this.props}
                        className="challenge-list-widget"
                        widgetTitle={this.props.intl.formatMessage(messages.currentChallengesLabel)}>
              <AssociatedChallengeList {...this.props} challenges={this.props.challenges}
                removeChallenge={(challengeId) => this.removeChallenge(challengeId, projectId, this.props)} />
            </QuickWidget>
          </div>
        </div>
      </div>
    )
  }
}

export default WithManageableProjects(
  WithCurrentProject(injectIntl(manageChallengeList), {includeChallenges: true}),
      'adminChallengeList',
      'challenges',
      'resultChallenges',
    )
