import React, { Component } from 'react'
import { denormalize } from 'normalizr'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import { challengeDenormalizationSchema,
         challengeResultEntity,
         fetchChallenge,
         fetchChallengeComments,
         fetchChallengeActivity,
         fetchChallengeActions } from '../../../../services/Challenge/Challenge'
import { addError } from '../../../../services/Error/Error'
import AppErrors from '../../../../services/Error/AppErrors'
import AsManageableChallenge
       from '../../../../interactions/Challenge/AsManageableChallenge'
import WithClusteredTasks
       from '../../../HOCs/WithClusteredTasks/WithClusteredTasks'
import WithChallengeManagement
       from '../WithChallengeManagement/WithChallengeManagement'

/**
 * WithCurrentChallenge makes available to the WrappedComponent the current
 * challenge from the route as well as relevant admin functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentChallenge = function(WrappedComponent) {
  return class extends Component {
    state = {
      loadingChallenge: true,
    }

    currentChallengeId = () =>
      parseInt(_get(this.props, 'match.params.challengeId'), 10)

    loadChallenge = () => {
      const challengeId = this.currentChallengeId()

      if (_isFinite(challengeId)) {
        this.setState({loadingChallenge: true})

        // Start by fetching the challenge. Then fetch follow-up data.
        return this.props.fetchChallenge(challengeId).then(normalizedChallengeData => {
          const challenge = challengeResultEntity(normalizedChallengeData)

          Promise.all([
            this.props.fetchChallengeComments(challengeId),
            this.props.fetchChallengeActivity(challengeId, new Date(challenge.created)),
            this.props.fetchChallengeActions(challengeId),
          ]).then(() => this.setState({loadingChallenge: false}))
        })
      }
      else {
        this.setState({loadingChallenge: false})
      }
    }

    componentDidMount() {
      this.loadChallenge()
    }

    render() {
      const challengeId = this.currentChallengeId()
      let challenge = null
      let clusteredTasks = null

      if (_isFinite(challengeId)) {
        challenge = AsManageableChallenge(
          denormalize(_get(this.props, `entities.challenges.${challengeId}`),
                      challengeDenormalizationSchema(),
                      this.props.entities)
        )
      }

      return <WrappedComponent key={challengeId}
                               challenge={challenge}
                               clusteredTasks={clusteredTasks}
                               loadingChallenge={this.state.loadingChallenge}
                               refreshChallenge={this.loadChallenge}
                               {..._omit(this.props, ['entities',
                                                      'fetchChallenge',
                                                      'fetchChallengeComments',
                                                      'clusteredTasks',
                                                      'fetchChallengeActivity'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchChallenge: challengeId => {
    return dispatch(
      fetchChallenge(challengeId)
    ).then(normalizedResults => {
      if (!_isFinite(normalizedResults.result) ||
          _get(normalizedResults,
                `entities.challenges.${normalizedResults.result}.deleted`)) {
        dispatch(addError(AppErrors.challenge.doesNotExist))
        ownProps.history.push('/admin/projects')
      }

      return normalizedResults
    })
  },

  fetchChallengeComments: challengeId =>
    dispatch(fetchChallengeComments(challengeId)),

  fetchChallengeActivity: (challengeId, startDate, endDate) =>
    dispatch(fetchChallengeActivity(challengeId, startDate, endDate)),

  fetchChallengeActions: (challengeId, suppressReceive, criteria) => {
    return dispatch(fetchChallengeActions(challengeId, suppressReceive, criteria))
  },
})

export default (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithClusteredTasks(
      WithChallengeManagement(
        WithCurrentChallenge(WrappedComponent)
      )
    )
  )
