import { connect } from 'react-redux'
import _isObject from 'lodash/isObject'
import _get from 'lodash/get'
import { loadPreviousSequentialTaskFromChallenge,
         loadNextSequentialTaskFromChallenge }
       from '../../../../services/Task/Task'

/**
 * WithTaskReview makes functions available for reviewing a task, such as
 * moving to the previous or next sequential task, opening the task editor,
 * etc.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithTaskReview = WrappedComponent =>
  connect(null, mapDispatchToProps)(WrappedComponent)

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /**
     * Move to the previous sequential task during challenge review.
     */
    previousSequentialTask: task => {
      dispatch(
        loadPreviousSequentialTaskFromChallenge(task.parent.id, task.id)
      ).then(newTask =>
        reviewNewTask(task, newTask, ownProps.history)
      )
    },

    /**
     * Move to the next sequential task during challenge review.
     */
    nextSequentialTask: task => {
      dispatch(
        loadNextSequentialTaskFromChallenge(task.parent.id, task.id)
      ).then(newTask =>
        reviewNewTask(task, newTask, ownProps.history)
      )
    },

    /**
     * Edit the the given task data as a challenge owner.
     */
    editManagedTask: task => {
      ownProps.history.push(
        `/admin/project/${task.parent.parent.id}` +
        `/challenge/${task.parent.id}/task/${task.id}/edit`
      )
    },
  }
}

/**
 * Route to the given new task, if valid. Otherwise route back to the manage
 * challenge page.
 */
export const reviewNewTask = function(currentTask, newTask, history) {
  const projectId = _get(currentTask, 'parent.parent.id', currentTask.parent.parent)
  const challengeId = currentTask.parent.id

  if (_isObject(newTask) && newTask.id !== currentTask.id) {
    history.push(`/admin/project/${projectId}` +
                 `/challenge/${challengeId}/task/${newTask.id}/review`)
  }
  else {
    // Probably no tasks left in this challenge, back to challenge.
    history.push(`/admin/project/${projectId}/challenge/${challengeId}`)
  }
}

export default WithTaskReview
