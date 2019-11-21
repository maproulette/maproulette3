import React, { Component } from 'react'
import { connect } from 'react-redux'
import { startTask, releaseTask } from '../../../services/Task/Task'
import _get from 'lodash/get'
import AppErrors from '../../../services/Error/AppErrors'
import { addError } from '../../../services/Error/Error'

/**
 * WithLockedTask provides a means of locking and unlocking a task the user is
 * about to work on.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithLockedTask = function(WrappedComponent) {
  return class extends Component {
    componentDidMount() {
      this.props.startTask(this.props.task)
    }

    componentDidUpdate(prevProps) {
      if (_get(prevProps, 'task.id') !== _get(this.props, 'task.id')) {
        prevProps.releaseTask(prevProps.task)
        this.props.startTask(this.props.task)
      }
    }

    componentWillUnmount() {
      this.props.releaseTask(this.props.task)
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

export const mapStateToProps = state => ({})

export const mapDispatchToProps = (dispatch, ownProps) => ({
  startTask: (task) => {
    dispatch(startTask(task.id)).catch(error => {
      dispatch(addError(AppErrors.task.locked))
      ownProps.history.push(`/browse/challenges/${_get(task, 'parent.id', task.parent)}`)
    })
  },
  releaseTask: (task) => dispatch(releaseTask(task.id)),
})

export default WrappedComponent =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithLockedTask(WrappedComponent))
