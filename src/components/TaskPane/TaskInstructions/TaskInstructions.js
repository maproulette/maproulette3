import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import MarkdownTemplate from '../../MarkdownContent/MarkdownTemplate'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'


/**
 * TaskInstructions displays, as Markdown, the instructions for the given task
 * or, if task instructions are not available, the instructions for the parent
 * challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskInstructions extends Component {
  render() {
    const taskInstructions =
        !_isEmpty(this.props.task.instruction) ?
           this.props.task.instruction :
           _get(this.props.task, 'parent.instruction')

    if (_isEmpty(taskInstructions)) {
      return null
    }

    const taskProperties = AsMappableTask(this.props.task).allFeatureProperties()
    return (
      <div className="task-instructions">
        <MarkdownTemplate content={taskInstructions}
                          properties={taskProperties}
                          completionResponses={this.props.completionResponses}
                          setCompletionResponse={this.props.setCompletionResponse}
                          disableTemplate={this.props.disableTemplate}/>
      </div>
    )
  }
}

TaskInstructions.propTypes = {
  task: PropTypes.object.isRequired,
}
