import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import { fetchNearbyTasks } from '../../../services/Task/Task'

/**
 * WithNearbyTasks provides tasks geographically closest to the current task
 * to the wrapped component, utilizing the same object structure as
 * clusteredTasks for maximum interoperability
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithNearbyTasks = function(WrappedComponent) {
  class _WithNearbyTasks extends Component {
    state = {
      nearbyTasks: null,
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
     * Kick off loading of tasks geographically closest to the current task.
     * Note that this represents the nearby tasks (and loading status) using
     * the same data structure as clusteredTasks to promote map and HOC
     * interoperability
     *
     * @private
     */
    updateNearbyTasks = props => {
      const challengeId = this.currentChallengeId(props)
      const isVirtual = this.isVirtualChallenge(props)
      const excludeSelfLockedTasks = !!props.excludeSelfLockedTasks

      if (_isFinite(challengeId)) {
        this.setState({nearbyTasks: {loading: true}})
        props.fetchNearbyTasks(challengeId, isVirtual, props.taskId, excludeSelfLockedTasks).then(nearbyTasks => {
          this.setState({nearbyTasks: {...nearbyTasks, nearTaskId: props.taskId, loading: false}})
        })
      }
    }

    componentDidMount() {
      this.updateNearbyTasks(this.props)
    }

    componentDidUpdate() {
      if (this.state.nearbyTasks && !this.state.nearbyTasks.loading &&
          this.props.taskId !== this.state.nearbyTasks.nearTaskId) {
        this.updateNearbyTasks(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['fetchNearbyTasks'])}
          nearbyTasks={this.state.nearbyTasks}
        />
      )
    }
  }

  _WithNearbyTasks.propTypes = {
    fetchNearbyTasks: PropTypes.func.isRequired,
  }

  return _WithNearbyTasks
}

export const mapDispatchToProps =
  dispatch => bindActionCreators({ fetchNearbyTasks }, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithNearbyTasks(WrappedComponent))

