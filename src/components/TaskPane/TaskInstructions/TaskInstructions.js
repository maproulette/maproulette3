import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import Button from '../../Button/Button'
import MarkdownTemplate from '../../MarkdownContent/MarkdownTemplate'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import messages from '../Messages'


/**
 * TaskInstructions displays, as Markdown, the instructions for the given task
 * or, if task instructions are not available, the instructions for the parent
 * challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskInstructions extends Component {
  state = {
    responsesChanged: false
  }

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
                          setCompletionResponse={(propName, value) => {
                            this.props.setCompletionResponse(propName, value)
                            this.setState({responsesChanged: true})
                          }} />
        {this.props.disableTemplate && this.state.responsesChanged &&
          <Button
            className="mr-button--blue-fill mr-button--small"
            onClick={() => {
              this.props.saveCompletionResponses(this.props.task, this.props.completionResponses)
              this.setState({responsesChanged: false})
            }}
          >
            <FormattedMessage {...messages.saveChangesLabel} />
          </Button>
        }
      </div>
    )
  }
}

TaskInstructions.propTypes = {
  task: PropTypes.object.isRequired,
}
