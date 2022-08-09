import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { startTask, releaseTask, refreshTaskLock }
       from '../../../services/Task/Task'
import _get from 'lodash/get'
import _omit from 'lodash/omit'

// Used for lock storage events. Users will be locked from other task tabs
// if logging out, signing back in, or have multiple tabs on one task
const lockStorage = {
  setLock: (taskId) => {
    localStorage.setItem(`lock-${taskId}`, true);
  },

  removeLock: (taskId) => {
    localStorage.removeItem(`lock-${taskId}`);
  },

  isLocked: (taskId) => {
    const isLocked = localStorage.getItem(`lock-${taskId}`);

    if (isLocked) {
      return true
    }

    return false;
  }
}


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
      failureDetails: null,
    }

    lockTask = task => {
      if (!task) {
        return Promise.reject("Invalid task")
      }

      this.setState({tryingLock: true, failureDetails: null})
      return this.props.startTask(task.id).then(() => {
        if (this.state.readOnly) {
          this.setState({readOnly: false})
        }

        this.setState({tryingLock: false})

        lockStorage.setLock(task.id);

        return true
      }).catch(err => {
        this.setState({readOnly: true, tryingLock: false, failureDetails: err.details})
        return false
      })
    }

    unlockTask = task => {
      if (!task) {
        return Promise.reject("Invalid task")
      }

      this.props.releaseTask(task.id).then(() => {
        //wait for lock to be cleared in db and provide some leeway 
        //time with setTimeout before triggering storage event
        setTimeout(() => lockStorage.removeLock(task.id), 1500);
      }).catch(() => null)
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
          this.setState({readOnly: false, failureDetails: null})
        }

        lockStorage.setLock(task.id);

        return true
      }).catch(err => {
        this.setState({readOnly: true, failureDetails: err.details})
        return false
      })
    }

    syncLocks = () => {
      const { task } = this.props;

      if (task) {
        if (!lockStorage.isLocked(task.id)) {
          this.refreshTaskLock(task)
        }
      }
    }

    componentDidMount() {
      const { task } = this.props;

      if (task) {
        this.lockTask(task)
      }

      window.addEventListener('storage', this.syncLocks)
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
      const { task } = this.props;
      window.removeEventListener('storage', this.syncLocks);

      if (task) {
        this.unlockTask(task)
        lockStorage.removeLock(task.id)
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ['startTask', 'releaseTask'])}
          taskReadOnly={this.state.readOnly}
          tryingLock={this.state.tryingLock}
          lockFailureDetails={this.state.failureDetails}
          tryLocking={this.lockTask}
          refreshTaskLock={this.refreshTaskLock}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch =>
  bindActionCreators({ startTask, releaseTask, refreshTaskLock }, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithLockedTask(WrappedComponent))
