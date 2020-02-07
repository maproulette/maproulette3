import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _values from 'lodash/values'
import { fetchChallengeSnapshotList,
         recordChallengeSnapshot } from '../../../../services/Challenge/ChallengeSnapshot'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'

const WithChallengeSnapshots = function(WrappedComponent, applyFilters = false) {
  return class extends Component {
    state = {
      loading: false,
      snapshotList: [],
      selectedSnapshot: null
    }

    updateSnapshots(props) {
      const challengeId =_get(props.challenge, 'id')
      if (challengeId) {
        this.setState({loading: true})

        fetchChallengeSnapshotList(challengeId, true).then(normalizedResults => {
          let fetchedSnapshots = _values(normalizedResults.result)
          this.setState({loading: false, snapshotList: fetchedSnapshots})
        })
      }
    }

    recordSnapshot(props) {
      const challengeId =_get(props.challenge, 'id')

      if (challengeId) {
        this.setState({loading: true})
        recordChallengeSnapshot(challengeId).then(() => {
          this.updateSnapshots(props)
        })
      }
    }

    setSelectedSnapshot = (snapshotId) => {
      if (snapshotId) {
        const snapshot = _find(this.state.snapshotList, s => s.id === snapshotId)
        this.setState({selectedSnapshot: snapshot})

      }
      else {
        this.setState({selectedSnapshot: null})
      }
    }

    componentDidMount() {
      this.updateSnapshots(this.props)
    }

    componentDidUpdate(prevProps, prevState) {
      const challengeId =_get(this.props.challenge, 'id')
      if (challengeId && challengeId !== _get(prevProps.challenge, 'id')) {
        this.updateSnapshots(this.props)
      }
    }

    render() {
      // If we don't have a selectedSnapshot in our state then we want to show
      // the "current" metrics which are passed to us in our props.
      const reviewActions = _get(this.state.selectedSnapshot, 'reviewActions')
      const reviewMetrics = reviewActions ? {
        total: reviewActions.total,
        reviewRequested: reviewActions.requested,
        reviewApproved: reviewActions.approved,
        reviewRejected: reviewActions.rejected,
        reviewAssisted: reviewActions.assisted,
        reviewDisputed: reviewActions.disputed
      } : this.props.reviewMetrics

      return <WrappedComponent
               {...this.props}
               recordSnapshot={() => this.recordSnapshot(this.props)}
               snapshotList={this.state.snapshotList}
               setSelectedSnapshot={this.setSelectedSnapshot}
               currentMetrics={this.props.taskMetrics}
               taskMetrics =
                 {_get(this.state.selectedSnapshot, 'actions') || this.props.taskMetrics}
               taskMetricsByPriority =
                 {_get(this.state.selectedSnapshot, 'priorityActions') || this.props.taskMetricsByPriority}
               reviewMetrics={reviewMetrics}
             />

    }
  }
}


export default (WrappedComponent, applyFilters = false) =>
    WithComputedMetrics(injectIntl(WithChallengeSnapshots(WrappedComponent, applyFilters)))
