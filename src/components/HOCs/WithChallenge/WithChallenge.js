import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import { fetchChallenge }
       from '../../../services/Challenge/Challenge'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithChallenge provides functions for loading a challenge.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallenge = function(WrappedComponent) {
  class _WithChallenge extends Component {
    state = {
      challenge: null,
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

      if (_get(this.state, 'challenge.id') !== challengeId) {
        let challenge = _get(props.entities, `challenges.${challengeId}`)

        if (_isObject(challenge)) {
          this.setState({
            challenge: challenge
          })
        }
        else {
          this.props.loadChallenge(challengeId)
        }
      }
    }

    componentWillMount() {
      this.updateChallenge(this.props)
    }

    render() {
      return (
        <WrappedComponent challenge = {this.state.challenge}
                          {..._omit(this.props, ['loadChallenge'])} />
      )
    }
  }

  return _WithChallenge
}

const mapStateToProps = state => ({
})

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadChallenge:
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
      }
  }
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithChallenge(WrappedComponent))
