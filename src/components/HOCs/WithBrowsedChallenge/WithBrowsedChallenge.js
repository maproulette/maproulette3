import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _find from 'lodash/find'
import _omit from 'lodash/omit'
import WithClusteredTasks from '../WithClusteredTasks/WithClusteredTasks'

/**
 * WithBrowsedChallenge provides functions for starting and stopping browsing
 * of a challenge, and passes down the challenge being actively browsed (if
 * any). Once browsing begins, fetching of the challenge's clustered tasks is
 * initiated.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithBrowsedChallenge = function(WrappedComponent) {
  return class extends Component {
    state = {
      browsedChallenge: null,
    }

    /**
     * Updates the local state to set the browsedChallenge to that indicated in
     * the current route (if it's different), as well as kicking off loading of
     * the challenge's clustered tasks.
     *
     * @private
     */
    updateBrowsedChallenge = props => {
      const challengeId = parseInt(_get(props, 'match.params.challengeId'), 10)

      if (!isNaN(challengeId)) {
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
      return (
        <WrappedComponent browsedChallenge = {this.state.browsedChallenge}
                          startBrowsingChallenge={this.startBrowsingChallenge}
                          stopBrowsingChallenge={this.stopBrowsingChallenge}
                          {..._omit(this.props, 'entities')} />
      )
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

export default WrappedComponent =>
  connect(mapStateToProps)(WithClusteredTasks(WithBrowsedChallenge(WrappedComponent)))
