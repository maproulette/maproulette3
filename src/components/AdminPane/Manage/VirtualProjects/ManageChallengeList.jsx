import { Component } from 'react'
import _isObject from 'lodash/isObject'
import _omit from 'lodash/omit'
import _isEmpty from 'lodash/isEmpty'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import WithManageableProjects
       from '../../HOCs/WithManageableProjects/WithManageableProjects'
import WithCurrentProject from '../../HOCs/WithCurrentProject/WithCurrentProject'
import WithSearch from '../../../HOCs/WithSearch/WithSearch'
import WithSearchResults from '../../../HOCs/WithSearchResults/WithSearchResults'
import WithCommandInterpreter from '../../../HOCs/WithCommandInterpreter/WithCommandInterpreter'
import WithPermittedChallenges from '../../HOCs/WithPermittedChallenges/WithPermittedChallenges'
import WithPagedChallenges from '../../../HOCs/WithPagedChallenges/WithPagedChallenges'
import { extendedFind } from '../../../../services/Challenge/Challenge'
import SearchBox from '../../../SearchBox/SearchBox'
import AssociatedChallengeList from './AssociatedChallengeList'
import QuickWidget from '../../../QuickWidget/QuickWidget'
import Header from '../../../Header/Header'
import Button from '../../../Button/Button'
import ChallengeIdResult from "./ChallengeIdResult";

import BusySpinner from '../../../BusySpinner/BusySpinner'
import manageMessages from '../Messages'
import messages from './Messages'

// Setup child components with needed HOCs.
const ChallengeSearch = WithSearch(
  WithCommandInterpreter(SearchBox, ['p', 'i']),
  'adminChallengeList',
  searchCriteria => {
    if (!_isEmpty(searchCriteria?.filters)) {
      return extendedFind({filters: searchCriteria?.filters ?? {},
                           onlyEnabled: false}, 1000);
    }
    else {
      return extendedFind({searchQuery: searchCriteria.query,
                           onlyEnabled: false}, 1000)
    }
  },
)

const SearchResults = (props) => {
  return (
    <>
      <ChallengeIdResult {...props} />
      <AssociatedChallengeList {...props} />
    </>
  )
}

const ChallengeSearchResults =
  WithPermittedChallenges(
    WithSearchResults(
      WithPagedChallenges(SearchResults, 'challenges'),
                      'adminChallengeList', 'challenges')
  )

/**
 * Allows adding and removing challenges from the virtual project challenge list.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class manageChallengeList extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }

  done(props) {
    props.history.push(`/admin/project/${props.project.id}`)
  }

  render() {
    if (!this.props.project) {
      return <BusySpinner />
    }

    const searchControl = this.props.projects.length === 0 ? null : (
      <ChallengeSearch
        placeholder={this.props.intl.formatMessage(messages.searchPlaceholder)}
      />
    )

    const projectName = this.props.project?.displayName
    const listTitle =
      `${this.props.intl.formatMessage(messages.currentChallengesLabel)} ${projectName}`

    const doneButton =
      <Button onClick={() => this.done(this.props)}>
        <FormattedMessage {...messages.doneLabel} />
      </Button>

    const breadcrumbs =
      <nav className="breadcrumb mr-mt-2" aria-label="breadcrumbs">
        <ul>
          <li className="nav-title">
            <Link to='/admin/projects'>
              <FormattedMessage {...manageMessages.manageHeader} />
            </Link>
          </li>
          {_isObject(this.props.project) &&
          <li>
            <Link to={`/admin/project/${this.props.project.id}`}>
              {this.props.project?.displayName ?? (this.props.project.name)}
            </Link>
          </li>
          }
          <li className="is-active">
            <a aria-current="page">
              <FormattedMessage {...messages.manageChallengesLabel} />
            </a>
            {this.props.loadingProject && <BusySpinner inline />}
          </li>
        </ul>
      </nav>

    return (
      <div className="admin__manage edit-project mr-cards-inverse">
        <Header
          className="mr-px-8 mr-pt-4"
          eyebrow={breadcrumbs}
          title={""}
          actions={doneButton}
        />

        <div className="md:mr-grid md:mr-grid-gap-8 md:mr-grid-columns-2">
          <div className="mr-max-w-2xl mr-mx-auto mr-bg-black-15 mr-my-4 mr-p-4 mr-rounded">
            <QuickWidget
              {...this.props}
              className="challenge-list-widget"
              widgetTitle={this.props.intl.formatMessage(messages.findChallengesLabel)}
              rightHeaderControls={searchControl}
            >
              <ChallengeSearchResults
                {..._omit(this.props, 'challenges')}
                toBeAdded
                challenges={this.props.filteredChallenges || []}
                excludeChallenges={this.props.challenges}
                allStatuses={true}
              />
            </QuickWidget>
          </div>
          <div
            className="mr-max-w-2xl mr-mx-auto mr-bg-black-15 mr-my-4 mr-p-4 mr-rounded mr-w-full"
          >
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
