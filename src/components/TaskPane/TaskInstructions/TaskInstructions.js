import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'

/**
 * TaskInstructions displays, as Markdown, the instructions for the given task
 * or, if task instructions are not available, the instructions for the parent
 * challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskInstructions extends Component {
  render() {
    const taskInstructions = !_isEmpty(this.props.task.instruction) ?
                             this.props.task.instruction :
                             _get(this.props.task, 'parent.instruction')

    if (_isEmpty(taskInstructions)) {
      return null
    }

    return <MarkdownContent markdown={taskInstructions} />
  }
}

TaskInstructions.propTypes = {
  task: PropTypes.object.isRequired,
}
