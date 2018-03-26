import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isObject from 'lodash/isObject'
import _isFinite from 'lodash/isFinite'
import _debounce from 'lodash/debounce'
import _find from 'lodash/find'
import _omit from 'lodash/omit'
import { fetchChallenge }
       from '../../../services/Challenge/Challenge'

const FRESHNESS_THRESHOLD = 5000 // 5 seconds

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
      loadingBrowsedChallenge: false,
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
            this.state.loadingBrowsedChallenge) {
          const challenge = isVirtual ? this.props.virtualChallenge :
                            _find(props.challenges, {id: challengeId})

          if (_isObject(challenge)) {
            this.setState({
              browsedChallenge: challenge,
              loadingBrowsedChallenge: false,
              isVirtual
            })

            if (challenge.id !== _get(this.props, 'clusteredTasks.challengeId') ||
                isVirtual !== _get(this.props, 'clusteredTasks.isVirtualChallenge')) {
              this.props.fetchClusteredTasks(challenge.id, isVirtual)
            }
          }
          else if (!isVirtual) {
            // We don't have the challenge available, so fetch it.
            this.setState({
              browsedChallenge: {id: challengeId},
              loadingBrowsedChallenge: true,
              isVirtual,
            })

            props.loadChallenge(challengeId)
          }
        }
      }
      else if (_isObject(this.state.browsedChallenge &&
               !this.state.loadingBrowsedChallenge)) {
        this.setState({browsedChallenge: null, isVirtual: false})
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
      if (challenge.isVirtual) {
        this.props.history.push(`/browse/virtual/${challenge.id}`)
      }
      else {
        this.props.history.push(`/browse/challenges/${challenge.id}`)
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
        <WrappedComponent browsedChallenge = {this.state.browsedChallenge}
                          loadingBrowsedChallenge = {this.state.loadingBrowsedChallenge}
                          startBrowsingChallenge={this.startBrowsingChallenge}
                          stopBrowsingChallenge={this.stopBrowsingChallenge}
                          clusteredTasks={clusteredTasks}
                          {..._omit(this.props, ['entities',
                                                 'clusteredTasks',
                                                 'loadChallenge'])} />
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

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadChallenge: _debounce(
      challengeId => {
        return dispatch(fetchChallenge(challengeId))
      },
      FRESHNESS_THRESHOLD,
      {leading: true},
    ),
  }
}

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithBrowsedChallenge(WrappedComponent))
