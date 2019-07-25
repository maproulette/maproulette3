import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import { fetchTaskTags } from '../../../services/Task/Task'

const WithTaskTags = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedTaskTags(WrappedComponent))

export const mapStateToProps = (state, ownProps) => ({})

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    fetchTaskTags
  }, dispatch)
}

export const WithLoadedTaskTags = function(WrappedComponent) {
  return class extends Component {
    state = {
      tagsLoading: false,
    }

    loadTags = taskId => {
      if (!_isFinite(taskId)) {
        return
      }

      this.setState({tagsLoading: true})
      this.props.fetchTaskTags(taskId).then(
        () => this.setState({tagsLoading: false})
      )
    }

    componentDidMount() {
      this.loadTags(this.props.taskId)
    }

    componentDidUpdate(prevProps) {
      if (this.props.taskId !== prevProps.taskId) {
        this.loadTags(this.props.taskId)
      }
    }

    render() {
      return <WrappedComponent {..._omit(this.props, 'fetchTaskTags')}
                reloadTags={() => this.loadTags(this.props.taskId)} />
    }
  }
}

export default WithTaskTags
