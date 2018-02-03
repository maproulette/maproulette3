import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _filter from 'lodash/filter'
import _omit from 'lodash/omit'
import { fetchClusteredTasks } from '../../../services/Task/Task'

/**
 * WithTaskClusters makes clustered tasks from the given mappedChallenge
 * available to the given WrappedComponent via the clusteredTasks prop.
 *
 * > Note: unlike most data retrievals, clustered tasks are not stored in the
 * > redux store due to their potentially very large size. Instead they're
 * > simply represented here in local state.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithTaskClusters = function(WrappedComponent) {
  return class extends Component {
    state = {
      tasks: [],
    }

    loadClusters = challengeId => {
      if (_isNumber(challengeId)) {
        this.props.fetchClusteredTasks(challengeId).then(
          tasks => this.setState({tasks})
        )
      }
    }

    componentDidMount() {
      this.loadClusters(_get(this.props, 'mappedChallenge.id'))
    }

    componentWillReceiveProps(nextProps) {
      const nextChallengeId = _get(nextProps, 'mappedChallenge.id')

      if (nextChallengeId !== _get(this.props, 'mappedChallenge.id')) {
        this.loadClusters(nextChallengeId)
      }
    }

    render() {
      const challengeId = _get(this.props, 'mappedChallenge.id')
      let clusteredTasks = []

      if (_isNumber(challengeId)) {
        clusteredTasks = _filter(this.state.tasks,
                                 task => task.parent === challengeId && task.point
        )
      }

      return <WrappedComponent clusteredTasks={clusteredTasks} 
                               {..._omit(this.props,
                                         ['entities', 'fetchClusteredTasks'])} />
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchClusteredTasks: challengeId => dispatch(fetchClusteredTasks(challengeId))
})

export default WrappedComponent =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithTaskClusters(WrappedComponent))
