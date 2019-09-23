import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import { fromLatLngBounds } from '../../../services/MapBounds/MapBounds'
import { fetchTaskClusters } from '../../../services/Task/Task'

/**
 * WithChallengeTaskClusters makes available task clusters, within a challenge,
 * that match specified search/filter criteria
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithChallengeTaskClusters = function(WrappedComponent) {
  return class extends Component {
    state = {
      clusters: {},
      filters: {},
      boundingBox: null,
      loading: false,
    }

    setFilters = (filters={}) => {
      this.setState({filters})
      this.refreshClusters(filters, this.state.boundingBox)
    }

    setBoundingBox = bbox => {
      const boundingBox = fromLatLngBounds(bbox).join(',')
      this.setState({boundingBox})
      this.refreshClusters(this.state.filters, boundingBox)
    }

    refreshClusters = (filters, boundingBox) => {
      if (!_isFinite(filters.challengeId)) {
        return
      }

      this.setState({loading: true})
      this.props.fetchTaskClusters({filters, boundingBox}).then(clusters => {
        this.setState({clusters, loading: false})
      }).catch(error => {
        console.log("*** Error updating task clusters:")
        console.log(error)
        this.setState({clusters: {}, loading: false})
      })
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['fetchTaskClusters'])}
          taskClusters={this.state.clusters}
          challengeTaskClusterFilters={this.state.filters}
          setChallengeTaskClusterFilters={this.setFilters}
          challengeTaskClusterBoundingBox={this.state.boundingBox}
          setChallengeTaskClusterBoundingBox={this.setBoundingBox}
          challengeTaskClustersLoading={this.state.loading}
        />
      )
    }
  }
}

export const mapDispatchToProps =
  dispatch => bindActionCreators({ fetchTaskClusters }, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithChallengeTaskClusters(WrappedComponent))
