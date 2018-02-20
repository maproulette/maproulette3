import React, { Component } from 'react'
import { denormalize } from 'normalizr'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import { subMonths } from 'date-fns'
import { challengeDenormalizationSchema,
         fetchChallenge,
         fetchChallengeComments,
         fetchChallengeActivity,
         fetchChallengeActions,
         saveChallenge,
         removeChallenge,
         deleteChallenge } from '../../../../services/Challenge/Challenge'
import WithClusteredTasks
       from '../../../HOCs/WithClusteredTasks/WithClusteredTasks'

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

    loadChallenge = () => {
      const challengeId = this.currentChallengeId()

      if (!isNaN(challengeId)) {
        this.setState({loadingChallenge: true})
        const timelineStartDate = subMonths(new Date(), historicalMonths)

        Promise.all([
          this.props.fetchChallenge(challengeId),
          this.props.fetchChallengeComments(challengeId),
          this.props.fetchChallengeActivity(challengeId, timelineStartDate),
          this.props.fetchChallengeActions(challengeId),
        ]).then(() => this.setState({loadingChallenge: false}))

        if (includeTasks) {
          this.props.fetchClusteredTasks(challengeId).then(() =>
            this.setState({loadingTasks: false})
          )
        }
      }
      else {
        this.setState({loadingChallenge: false, loadingTasks: false})
      }
    }

    componentDidMount() {
      this.loadChallenge()
    }

    render() {
      const challengeId = this.currentChallengeId()
      let challenge = null
      let clusteredTasks = null

      if (!isNaN(challengeId)) {
        challenge =
          denormalize(_get(this.props, `entities.challenges.${challengeId}`),
                      challengeDenormalizationSchema(),
                      this.props.entities)

        if (includeTasks &&
            _get(this.props, 'clusteredTasks.challengeId') === challengeId) {
          clusteredTasks = this.props.clusteredTasks
        }
      }

      return <WrappedComponent key={challengeId}
                               challenge={challenge}
                               clusteredTasks={clusteredTasks}
                               loadingChallenge={this.state.loadingChallenge}
                               loadingTasks={this.state.loadingTasks}
                               refreshStatus={this.loadChallenge}
                               {..._omit(this.props, ['entities',
                                                      'fetchChallenge',
                                                      'fetchChallengeComments',
                                                      'fetchClusteredTasks',
                                                      'clusteredTasks',
                                                      'fetchChallengeActivity'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchChallenge: challengeId => dispatch(fetchChallenge(challengeId)),
  fetchChallengeComments: challengeId =>
    dispatch(fetchChallengeComments(challengeId)),
  fetchChallengeActivity: (challengeId, startDate, endDate) =>
    dispatch(fetchChallengeActivity(challengeId, startDate, endDate)),
  fetchChallengeActions: challengeId =>
    dispatch(fetchChallengeActions(challengeId)),
  saveChallenge: challengeData => dispatch(saveChallenge(challengeData)),
  deleteChallenge: (projectId, challengeId) => {
    // Optimistically remove the challenge.
    dispatch(removeChallenge(challengeId))

    dispatch(deleteChallenge(challengeId)).then(() =>
      ownProps.history.replace(`/admin/project/${projectId}`)
    )
  },
})

export default (WrappedComponent, includeTasks, historicalMonths) =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithClusteredTasks(
      WithCurrentChallenge(WrappedComponent, includeTasks, historicalMonths)
    )
  )
