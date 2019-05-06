import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import { fetchTaskHistory } from '../../../services/Task/Task'

const WithTaskHistory = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedTaskHistory(WrappedComponent))

export const mapStateToProps = (state, ownProps) => ({})

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({
    fetchTaskHistory
  }, dispatch)
}

export const WithLoadedTaskHistory = function(WrappedComponent) {
  return class extends Component {
    state = {
      historyLoading: false,
    }

    loadHistory = taskId => {
      if (!_isFinite(taskId)) {
        return
      }

      this.setState({historyLoading: true})
      this.props.fetchTaskHistory(taskId).then(
        () => this.setState({historyLoading: false})
      )
    }

    componentDidMount() {
      this.loadHistory(this.props.taskId)
    }

    componentDidUpdate(prevProps) {
      if (this.props.taskId !== prevProps.taskId) {
        this.loadHistory(this.props.taskId)
      }
    }

    render() {
      return <WrappedComponent {..._omit(this.props, 'fetchTaskHistory')}
                reloadHistory={() => this.loadHistory(this.props.taskId)} />
    }
  }
}

export default WithTaskHistory
