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
const WithChallenge = function(WrappedComponent) {
   return class extends Component {
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
      getChallenge(challengeId, props, this)
    }

    componentDidMount() {
      this.updateChallenge(this.props)
    }

    componentDidUpdate(prevProps) {
      if (this.parseChallengeId(this.props) !== this.parseChallengeId(prevProps)) {
        this.updateChallenge(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent challenge = {this.state.challenge}
                          {..._omit(this.props, ['loadChallenge'])} />
      )
    }
  }
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
            ownProps.history.push('/browse/challenges')
          }
          else {
            return _get(normalizedResults, `entities.challenges.${normalizedResults.result}`)
          }
        })
      }
  }
}

/**
 * This method fetches the challenge and calls setState.
 * It has been externalized from the component to aid in testing.
 */
export const getChallenge = (challengeId, props, component) => {
  if (_get(component.state, 'challenge.id') !== challengeId) {
    let challenge = _get(props.entities, `challenges.${challengeId}`)

    if (_isObject(challenge)) {
      component.setState({
        challenge: challenge
      })
    }
    else {
      props.loadChallenge(challengeId).then(challenge => {
        if (challenge) {
          component.setState({
            challenge: challenge
          })
        }
      })
    }
  }
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithChallenge(WrappedComponent))
