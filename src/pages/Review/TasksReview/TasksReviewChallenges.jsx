import { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import _map from 'lodash/map'
import _toLower from 'lodash/toLower'
import _filter from 'lodash/filter'
import _cloneDeep from 'lodash/cloneDeep'
import _merge from 'lodash/merge'
import _get from 'lodash/get'
import BusySpinner from '../../../components/BusySpinner/BusySpinner'
import WithReviewChallenges from '../../../components/HOCs/WithReviewChallenges/WithReviewChallenges'
import SearchBox from '../../../components/SearchBox/SearchBox'
import messages from './Messages'

/**
 * Presents a list of challenges (and parent projects) that have associated
 * reviews for a user to choose before loading the review tasks table.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
class TasksReviewChallenges extends Component {
  state = {
    searchQuery: {}
  }

  performSearch = (search, type) => {
    const searchQuery = _cloneDeep(this.state.searchQuery)

    searchQuery[this.props.reviewTasksType] =
      _merge({}, searchQuery[this.props.reviewTasksType], {[type]: search})

    this.setState({searchQuery})
  }

  matchesQuery(value, queryType) {
    const searchString = _get(this.state.searchQuery,
                              `${this.props.reviewTasksType}.${queryType}`,
                              "")
    return _toLower(value).includes(_toLower(searchString))
  }

  render() {
    if (!this.props.challenges) {
      return (
        <div className="mr-mt-8">
          <h3 className="mr-flex mr-justify-between mr-items-center mr-ml-8">
            <span>
              <FormattedMessage {...messages.chooseFilter} />
            </span>
    
            <div
              className="mr-inline-block mr-mx-4 mr-text-green-lighter mr-text-sm hover:mr-text-white mr-cursor-pointer"
              onClick={() => this.props.selectProject('')}
            >
              <FormattedMessage {...messages.viewAllTasks} />
            </div>
          </h3>
          <BusySpinner />
        </div>
      )
    }    

    const filteredChallenges = _filter(this.props.challenges,
      challenge => this.matchesQuery(challenge.name, 'challenge'))

    const filteredProjects =_filter(this.props.projects,
      project => this.matchesQuery(project.displayName, 'project'))

    const challengeList = _map(filteredChallenges, challenge => {
      return (
        <div
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-mb-2"
          onClick={() => this.props.selectChallenge(challenge.id, challenge.name)} key={challenge.id}>
          {challenge.name}
        </div>
      )
    })

    const projectList = _map(filteredProjects, project => {
      return (
        <div
          className="mr-text-green-lighter hover:mr-text-white mr-cursor-pointer mr-mb-2"
          onClick={() => this.props.selectProject(project.id, project.displayName)} key={project.id}>
          {project.displayName}
        </div>
      )
    })

    const projectSearchBox =
      <SearchBox
        setSearch={(search) => this.performSearch(search, "project")}
        clearSearch={() => this.performSearch(null, "project")}
        searchQuery={{query: _get(this.state.searchQuery,
                                  `${this.props.reviewTasksType}.project`)}}
      />

    const challengeSearchBox =
      <SearchBox
        setSearch={(search) => this.performSearch(search, "challenge")}
        clearSearch={() => this.performSearch(null, "challenge")}
        searchQuery={{query: _get(this.state.searchQuery,
                                  `${this.props.reviewTasksType}.challenge`)}}
      />

    return (
      <div className="mr-mt-8">
        <h3 className="mr-flex mr-justify-between mr-items-center mr-ml-8">
          <span>
            <FormattedMessage {...messages.chooseFilter} />
          </span>

          <div className="mr-inline-block mr-mx-4 mr-text-green-lighter mr-text-sm hover:mr-text-white mr-cursor-pointer"
            onClick={() => this.props.selectProject('')}>
            <FormattedMessage {...messages.viewAllTasks} />
          </div>
        </h3>

        <div className="mr-flex mr-justify-left mr-p-8">
          <div className="mr-card-widget mr-w-full mr-mr-8 mr-p-4 mr-max-h-screen50">
            <div className="mr-flex mr-justify-between mr-items-center mr-pb-4">
              <h2 className="mr-card-widget__title">
                <FormattedMessage {...messages.reviewByProject} />
              </h2>
              {projectSearchBox}
            </div>
            <div className="mr-overflow-y-scroll">
              {projectList}
            </div>
          </div>
          <div className="mr-card-widget mr-w-full mr-p-4 mr-max-h-screen50">
            <div className="mr-flex mr-justify-between mr-items-center mr-pb-4">
              <h2 className="mr-card-widget__title">
                <FormattedMessage {...messages.reviewByChallenge} />
              </h2>
              {challengeSearchBox}
            </div>
            <div className="mr-overflow-y-scroll">
              {challengeList}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WithReviewChallenges(injectIntl(TasksReviewChallenges))
