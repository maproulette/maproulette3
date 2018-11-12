import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import _omit from 'lodash/omit'
import { fetchChallenge }
       from '../../../services/Challenge/Challenge'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

const FRESHNESS_THRESHOLD = 60000 // 1 minute

/**
 * WithChallenge provides functions for loading a challenge.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallenge = function(WrappedComponent) {
  class _WithChallenge extends Component {
    state = {
      challenge: null,
      loadingChallenge: null,
    }

    /**
     * Parses the challenge id from the matched params of the route
     *
     * @private
     */
    parseChallengeId = props =>
      parseInt(_get(props, 'match.params.challengeId'), 10)

    /**
     * Updates the local state to set the challenge to that indicated in
     * the current route (if it's different)
     *
     * @private
     */
    updateChallenge = props => {
      const challengeId = this.parseChallengeId(props)

      if (_isFinite(challengeId)) {
        if (_get(this.state, 'challenge.id') !== challengeId ||
            _isFinite(this.state.loadingBrowsedChallenge)) {
          let challenge = _get(props.entities, `challenges.${challengeId}`)

          if (_isObject(challenge)) {
            // If our challenge data is stale, refresh it.
            if (Date.now() - challenge._meta.fetchedAt > FRESHNESS_THRESHOLD) {
              challenge = null
            }
          }

          if (_isObject(challenge)) {
            this.setState({
              challenge: challenge,
              loadingChallenge: null
            })
          }
        }
      }
      else if (_isObject(this.state.challenge)) {
        this.setState({
          challenge: null,
          loadingChallenge: null
        })
      }
    }

    componentWillMount() {
      this.updateChallenge(this.props)
    }

    componentWillReceiveProps(nextProps) {
      this.updateChallenge(nextProps)
    }

    render() {
      return (
        <WrappedComponent challenge = {this.state.challenge}
                          loadingChallenge = {this.state.loadingChallenge}
                          {..._omit(this.props, ['entities',
                                                 'loadChallenge'])} />
      )
    }
  }

  return _WithChallenge
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
            ownProps.history.push('/')
          }
        })
      },
      5000,
      {leading: true},
    ),
  }
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithChallenge(WrappedComponent))
