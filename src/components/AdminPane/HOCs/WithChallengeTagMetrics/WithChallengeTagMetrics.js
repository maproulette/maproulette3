import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'
import _merge from 'lodash/merge'
import { fetchTagMetrics }
       from '../../../../services/Challenge/Challenge'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'

/**
 * WithChallengeTagMetrics retrieves tag metrics for the challenge tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeTagMetrics = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false
    }

    updateMetrics(props) {
      this.setState({loading: true})

      const filters = {challengeId: _get(props.challenge, 'id')}
       _merge(filters, _get(props.searchFilters, 'filters'))

      const criteria = {filters}
      criteria.invertFields = _get(props.searchCriteria, 'filters.invertFields')

      if (props.includeTaskStatuses) {
        criteria.filters.status = _keys(_pickBy(props.includeTaskStatuses, v => v)).join(',')
      }
      if (props.includeTaskReviewStatuses) {
        criteria.filters.reviewStatus = _keys(_pickBy(props.includeTaskReviewStatuses, v => v)).join(',')
      }
      if (props.includeTaskPriorities) {
        criteria.filters.priorities =_keys(_pickBy(props.includeTaskPriorities, v => v)).join(',')
      }

      props.updateTagMetrics(_get(props.user, 'id'), criteria).then((entity) => {
        this.setState({loading: false, tagMetrics: entity})
      })
    }

    componentDidMount() {
      this.updateMetrics(this.props)
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps.challenge, 'id') !== _get(this.props.challenge, 'id')) {
        return this.updateMetrics(this.props)
      }

      if (this.props.includeTaskStatuses !== prevProps.includeTaskStatuses) {
        return this.updateMetrics(this.props)
      }

      if (this.props.includeTaskReviewStatuses !== prevProps.includeTaskReviewStatuses) {
        return this.updateMetrics(this.props)
      }

      if (this.props.includeMetaReviewStatuses !== prevProps.includeMetaReviewStatuses) {
        return this.updateMetrics(this.props)
      }

      if (this.props.includeTaskPriorities !== prevProps.includeTaskPriorities) {
        return this.updateMetrics(this.props)
      }

      if (_get(this.props.searchFilters, 'filters') !== _get(prevProps.searchFilters, 'filters')) {
        return this.updateMetrics(this.props)
      }
    }

    render() {
      return (
        <WrappedComponent tagMetrics = {this.state.tagMetrics}
                          totalTasks = {_get(this.props, 'filteredClusteredTasks.totalCount')}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateTagMetrics'])} />)
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  updateTagMetrics: (userId, criteria) => {
    return dispatch(fetchTagMetrics(userId, criteria))
  },
})

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithCurrentUser(WithChallengeTagMetrics(WrappedComponent)))
