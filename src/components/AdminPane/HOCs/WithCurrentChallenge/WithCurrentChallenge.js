import React, { Component } from 'react'
import { denormalize } from 'normalizr'
import { connect } from 'react-redux'
import { get as _get,
         filter as _filter,
         values as _values,
         omit as _omit } from 'lodash'
import { subMonths } from 'date-fns'
import { challengeDenormalizationSchema,
         fetchChallenge,
         fetchChallengeComments,
         fetchChallengeActivity,
         fetchChallengeActions,
         saveChallenge,
         deleteChallenge } from '../../../../services/Challenge/Challenge'
import { fetchChallengeTasks } from '../../../../services/Task/Task'

/**
 * WithCurrentChallenge makes available to the WrappedComponent the current
 * challenge from the route as well as relevant admin functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentChallenge = function(WrappedComponent,
                                      includeTasks=false,
                                      historicalMonths=2) {
  return class extends Component {
    state = {
      loadingChallenge: true,
      loadingTasks: includeTasks,
    }

    currentChallengeId = () =>
      parseInt(_get(this.props, 'match.params.challengeId'), 10)

    componentDidMount() {
      const challengeId = this.currentChallengeId()

      if (!isNaN(challengeId)) {
        const timelineStartDate = subMonths(new Date(), historicalMonths)

        Promise.all([
          this.props.fetchChallenge(challengeId),
          this.props.fetchChallengeComments(challengeId),
          this.props.fetchChallengeActivity(challengeId, timelineStartDate),
          this.props.fetchChallengeActions(challengeId),
        ]).then(() => this.setState({loadingChallenge: false}))

        if (includeTasks) {
          this.props.fetchChallengeTasks(challengeId).then(() =>
            this.setState({loadingTasks: false})
          )
        }
      }
      else {
        this.setState({loadingChallenge: false, loadingTasks: false})
      }
    }

    render() {
      const challengeId = this.currentChallengeId()
      let challenge = null
      let tasks = []

      if (!isNaN(challengeId)) {
        challenge =
          denormalize(_get(this.props, `entities.challenges.${challengeId}`),
                      challengeDenormalizationSchema(),
                      this.props.entities)

        if (includeTasks) {
          const allTasks = _values(_get(this.props, 'entities.tasks', {}))
          tasks = _filter(allTasks, {parent: challengeId})
        }
      }

      return <WrappedComponent key={challengeId}
                               challenge={challenge}
                               tasks={tasks}
                               loadingChallenge={this.state.loadingChallenge}
                               loadingTasks={this.state.loadingTasks}
                               {..._omit(this.props, ['entities',
                                                      'fetchChallenge',
                                                      'fetchChallengeComments',
                                                      'fetchChallengeTasks',
                                                      'fetchChallengeActivity'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchChallenge: challengeId => dispatch(fetchChallenge(challengeId)),
  fetchChallengeComments: challengeId =>
    dispatch(fetchChallengeComments(challengeId)),
  fetchChallengeActivity: (challengeId, startDate, endDate) =>
    dispatch(fetchChallengeActivity(challengeId, startDate, endDate)),
  fetchChallengeActions: challengeId =>
    dispatch(fetchChallengeActions(challengeId)),
  fetchChallengeTasks: challengeId =>
    dispatch(fetchChallengeTasks(challengeId)),
  saveChallenge: challengeData => dispatch(saveChallenge(challengeData)),
  deleteChallenge: challengeId => dispatch(deleteChallenge(challengeId)),
})

export default (WrappedComponent, includeTasks, historicalMonths) =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithCurrentChallenge(WrappedComponent,
                                                   includeTasks,
                                                   historicalMonths))
