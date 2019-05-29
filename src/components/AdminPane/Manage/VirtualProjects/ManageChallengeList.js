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
import WithPermittedChallenges from '../../HOCs/WithPermittedChallenges/WithPermittedChallenges'
import WithPagedChallenges from '../../../HOCs/WithPagedChallenges/WithPagedChallenges'
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
  WithPermittedChallenges(
    WithSearchResults(
      WithPagedChallenges(AssociatedChallengeList, 'challenges'),
                      'adminChallengeList', 'challenges')
  )

/**
 * Allows adding and removing challenges from the virtual project challenge list.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class manageChallengeList extends Component {
  done(props) {
    props.history.push(`/admin/project/${props.project.id}`)
  }

  render() {
    if (!this.props.project) {
      return <BusySpinner />
    }

    const searchControl = this.props.projects.length === 0 ? null : (
      <ChallengeSearch className="mr-p-2 mr-text-grey-light mr-border mr-border-grey-light mr-rounded-sm"
                       inputClassName="mr-text-grey mr-leading-normal"
                       placeholder={"Search..."} />
    )

    const projectName = _get(this.props, 'project.displayName')
    const listTitle =
      `${this.props.intl.formatMessage(messages.currentChallengesLabel)} ${projectName}`

    const doneButton =
      <Button onClick={() => this.done(this.props)}>
        <FormattedMessage {...messages.doneLabel} />
      </Button>

    const breadcrumbs =
      <nav className="breadcrumb mr-mt-2" aria-label="breadcrumbs">
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
          className="mr-px-8 mr-pt-4"
          eyebrow={breadcrumbs}
          title={""}
          actions={doneButton}
        />

        <div className="md:mr-grid md:mr-grid-gap-8 md:mr-grid-columns-2">
          <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-my-4 mr-p-4 mr-rounded">
            <QuickWidget {...this.props}
                        className="challenge-list-widget"
                        widgetTitle={this.props.intl.formatMessage(messages.findChallengesLabel)}
                        rightHeaderControls={searchControl}>
              <ChallengeSearchResults {..._omit(this.props, 'challenges')} toBeAdded
                challenges={this.props.filteredChallenges || []}
                excludeChallenges={this.props.challenges}
                allStatuses={true} />
            </QuickWidget>
          </div>
          <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-my-4 mr-p-4 mr-rounded mr-w-full">
            <QuickWidget {...this.props}
                        className="challenge-list-widget"
                        widgetTitle={listTitle}>
              <AssociatedChallengeList {...this.props} challenges={this.props.challenges} />
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
