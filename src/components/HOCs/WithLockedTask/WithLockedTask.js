import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { startTask, releaseTask, refreshTaskLock }
       from '../../../services/Task/Task'
import _get from 'lodash/get'
import _omit from 'lodash/omit'

/**
 * WithLockedTask provides a means of locking and unlocking a task the user is
 * about to work on. If a lock cannot be acquired, the WrappedCompont will be
 * passed a `taskReadOnly` flag set to true
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithLockedTask = function(WrappedComponent) {
  return class extends Component {
    state = {
      readOnly: false,
      tryingLock: false,
    }

    lockTask = task => {
      if (!task) {
        return Promise.reject("Invalid task")
      }

      this.setState({tryingLock: true})
      return this.props.startTask(task.id).then(() => {
        if (this.state.readOnly) {
          this.setState({readOnly: false})
        }

        this.setState({tryingLock: false})
        return true
      }).catch(err => {
        this.setState({readOnly: true, tryingLock: false})
        return false
      })
    }

    unlockTask = task => {
      if (!task) {
        return Promise.reject("Invalid task")
      }

      return this.props.releaseTask(task.id)
    }

    /**
     * Refresh the lock on the task, extending its allowed duration
     */
    refreshTaskLock = task => {
      if (!task) {
        return Promise.reject("Invalid task")
      }

      return this.props.refreshTaskLock(task.id).then(() => {
        if (this.state.readOnly) {
          this.setState({readOnly: false})
        }

        return true
      }).catch(err => {
        this.setState({readOnly: true})
        return false
      })
    }

    componentDidMount() {
      if (this.props.task) {
        this.lockTask(this.props.task)
      }
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps, 'task.id') !== _get(this.props, 'task.id')) {
        if (prevProps.task) {
          this.unlockTask(prevProps.task)
        }

        if (this.props.task) {
          this.lockTask(this.props.task)
        }
      }
    }

    componentWillUnmount() {
      if (this.props.task) {
        this.unlockTask(this.props.task)
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['startTask', 'releaseTask'])}
          taskReadOnly={this.state.readOnly}
          tryingLock={this.state.tryingLock}
          tryLocking={this.lockTask}
          refreshTasklock={this.refreshTaskLock}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch =>
  bindActionCreators({ startTask, releaseTask, refreshTaskLock }, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithLockedTask(WrappedComponent))
