import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _find from 'lodash/find'
import _omit from 'lodash/omit'

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
    }

    /**
     * Parses the challenge id from the matched params of the route
     *
     * @private
     */
    currentChallengeId = (props) =>
      parseInt(_get(props, 'match.params.challengeId'), 10)


    /**
     * Updates the local state to set the browsedChallenge to that indicated in
     * the current route (if it's different), as well as kicking off loading of
     * the challenge's clustered tasks.
     *
     * @private
     */
    updateBrowsedChallenge = props => {
      const challengeId = this.currentChallengeId(props)

      if (_isFinite(challengeId)) {
        if (_get(this.state, 'browsedChallenge.id') !== challengeId) {
          const challenge = _find(props.challenges, {id: challengeId})

          if (_isObject(challenge)) {
            this.setState({browsedChallenge: challenge})

            if (challenge.id !== _get(this.props, 'clusteredTasks.challengeId')) {
              this.props.fetchClusteredTasks(challenge.id)
            }
          }
        }
      }
      else if (_isObject(this.state.browsedChallenge)) {
        this.setState({browsedChallenge: null})
      }
    }

    componentWillMount() {
      this.updateBrowsedChallenge(this.props)
    }

    componentWillReceiveProps(nextProps) {
      this.updateBrowsedChallenge(nextProps)
    }

    /**
     * Invoked to indicate that the user has begun browsing the given challenge
     * during challenge discovery.
     */
    startBrowsingChallenge = challenge => {
      this.props.history.push(`/browse/challenges/${challenge.id}`)
    }

    /**
     * Invoked to indicate that the user has stopped browsing (minimized) the given
     * challenge during challenge discovery.
     */
    stopBrowsingChallenge = () => {
      this.props.history.push('/browse/challenges')
    }

    render() {
      // Only pass down clusteredTasks if they match this challenge.
      const challengeId = this.currentChallengeId(this.props)
      const clusteredTasks = challengeId ===
                             _get(this.props, 'clusteredTasks.challengeId') ?
            this.props.clusteredTasks :
            null

      return (
        <WrappedComponent browsedChallenge = {this.state.browsedChallenge}
                          startBrowsingChallenge={this.startBrowsingChallenge}
                          stopBrowsingChallenge={this.stopBrowsingChallenge}
                          clusteredTasks={clusteredTasks}
                          {..._omit(this.props, ['entities', 'clusteredTasks'])} />
      )
    }
  }

  _WithBrowsedChallenge.propTypes = {
    clusteredTasks: PropTypes.object,
    fetchClusteredTasks: PropTypes.func.isRequired,
  }

  return _WithBrowsedChallenge
}

const mapStateToProps = state => ({
  entities: state.entities,
})

export default WrappedComponent =>
  connect(mapStateToProps)(WithBrowsedChallenge(WrappedComponent))
