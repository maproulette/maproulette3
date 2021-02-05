import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import _omit from 'lodash/omit'
import { fetchChallenge, fetchChallengeActions, challengeDenormalizationSchema }
       from '../../../services/Challenge/Challenge'
import { fetchProject }
       from '../../../services/Project/Project'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

const FRESHNESS_THRESHOLD = 60000 // 1 minute

/**
 * WithBrowsedChallenge provides functions for starting and stopping browsing
 * of a challenge, and passes down the challenge being actively browsed (if
 * any). Once browsing begins, fetching of the challenge's clustered tasks is
 * initiated.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithBrowsedChallenge = function(WrappedComponent) {
  class _WithBrowsedChallenge extends Component {
    state = {
      browsedChallenge: null,
      loadingBrowsedChallenge: null,
      isVirtual: false,
    }

    /**
     * Parses the challenge id from the matched params of the route
     *
     * @private
     */
    standardChallengeId = props =>
      parseInt(_get(props, 'match.params.challengeId'), 10)

    /**
     * Parses the virtual challenge id from the matched params of the route
     *
     * @private
     */
    virtualChallengeId = props =>
      parseInt(_get(props, 'match.params.virtualChallengeId'), 10)

    /**
     * Determines whether this challenge is a virtual challenge
     *
     * @private
     */
    isVirtualChallenge = props => _isFinite(this.virtualChallengeId(props))

    /**
     * Parses the current standard or virtual challenge id from the matched params
     * of the route.
     *
     * @private
     */
    currentChallengeId = props => this.isVirtualChallenge(props) ?
      this.virtualChallengeId(props) : this.standardChallengeId(props)

    /**
     * Returns a denormalized version of the current challenge
     *
     * @private
     */
    denormalizedChallenge = props => {
      const challengeId = this.currentChallengeId(props)
      const isVirtual = this.isVirtualChallenge(props)

      return isVirtual ?
             props.virtualChallenge : // nothing to denormalize for virtual challenges
             denormalize(_get(props.entities, `challenges.${challengeId}`),
                         challengeDenormalizationSchema(),
                         props.entities)
    }

    /**
     * Updates the local state to set the browsedChallenge to that indicated in
     * the current route (if it's different), as well as kicking off loading of
     * the challenge's clustered tasks.
     *
     * @private
     */
    updateBrowsedChallenge = props => {
      const challengeId = this.currentChallengeId(props)
      const isVirtual = this.isVirtualChallenge(props)

      if (_isFinite(challengeId)) {
        if (_get(this.state, 'browsedChallenge.id') !== challengeId ||
            this.state.isVirtual !== isVirtual ||
            _isFinite(this.state.loadingBrowsedChallenge)) {
          let challenge = this.denormalizedChallenge(props)
          if (_isObject(challenge)) {
            // If our challenge data is stale, refresh it.
            if (Date.now() - challenge._meta.fetchedAt > FRESHNESS_THRESHOLD) {
              challenge = null
            }
          }

          if (_isObject(challenge)) {
            this.setState({
              browsedChallenge: challenge,
              loadingBrowsedChallenge: null,
              isVirtual
            })
          }
          else if (!isVirtual && !_isFinite(this.state.loadingBrowsedChallenge)) {
            // We don't have the challenge available (and we're not in the middle
            // of loading it), so fetch it.
            this.setState({
              browsedChallenge: {id: challengeId},
              loadingBrowsedChallenge: challengeId,
              isVirtual,
            })

            props.loadChallenge(challengeId)
          }

          if (!isVirtual) {
            props.loadChallengeActions(challengeId)
          }
        }
      }
      else if (_isObject(this.state.browsedChallenge)) {
        this.setState({
          browsedChallenge: null,
          loadingBrowsedChallenge: null,
          isVirtual: false
        })
      }
    }

    componentDidMount() {
      this.updateBrowsedChallenge(this.props)
    }

    componentDidUpdate(prevProps) {
      this.updateBrowsedChallenge(this.props)
    }

    /**
     * Invoked to indicate that the user has begun browsing the given challenge
     * during challenge discovery.
     */
    startBrowsingChallenge = challenge => {
      if (challenge.isVirtual) {
        this.props.history.push(`/browse/virtual/${challenge.id}`)
      }
      else {
        this.props.history.push(`/browse/challenges/${challenge.id}`, {
          fromSearch: true,
        })
      }
    }

    /**
     * Invoked to indicate that the user has stopped browsing (minimized) the
     * challenge.
     */
    stopBrowsingChallenge = () => {
      this.props.history.push('/browse/challenges')
    }

    render() {
      // Only pass down clusteredTasks if they match this challenge.
      const challengeId = this.currentChallengeId(this.props)
      const isVirtual = this.isVirtualChallenge(this.props)

      let clusteredTasks = null
      if (challengeId === _get(this.props, 'clusteredTasks.challengeId') &&
          isVirtual === _get(this.props, 'clusteredTasks.isVirtualChallenge')) {
        clusteredTasks = this.props.clusteredTasks
      }

      return (
        <WrappedComponent browsedChallenge = {this.denormalizedChallenge(this.props)}
                          loadingBrowsedChallenge = {this.state.loadingBrowsedChallenge}
                          startBrowsingChallenge={this.startBrowsingChallenge}
                          stopBrowsingChallenge={this.stopBrowsingChallenge}
                          clusteredTasks={clusteredTasks}
                          {..._omit(this.props, ['entities',
                                                 'clusteredTasks',
                                                 'loadChallenge',
                                                 'loadChallengeActions'])} />
      )
    }
  }

  _WithBrowsedChallenge.propTypes = {
    clusteredTasks: PropTypes.object
  }

  return _WithBrowsedChallenge
}

const mapStateToProps = state => ({
  entities: state.entities,
})

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadChallenge: _debounce(
      challengeId => {
        return dispatch(
          fetchChallenge(challengeId)
        ).then(normalizedResults => {
          if (!_isFinite(normalizedResults.result) ||
              _get(normalizedResults,
                   `entities.challenges.${normalizedResults.result}.deleted`)) {
            dispatch(addError(AppErrors.challenge.doesNotExist))
            ownProps.history.push('/browse/challenges')
          }
          else {
            const projectId =
              _get(normalizedResults, `entities.challenges.${normalizedResults.result}.parent`)
            if (_isFinite(projectId)) {
              dispatch(fetchProject(projectId))
            }
          }
        })
      },
      5000,
      {leading: true},
    ),

    loadChallengeActions: challengeId => {
      return dispatch(fetchChallengeActions(challengeId))
    },
  }
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithBrowsedChallenge(WrappedComponent))
