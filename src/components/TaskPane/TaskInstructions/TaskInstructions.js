import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _keys from 'lodash/keys'
import _isEmpty from 'lodash/isEmpty'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'
import MarkdownContent from '../../MarkdownContent/MarkdownContent'

/**
 * TaskInstructions displays, as Markdown, the instructions for the given task
 * or, if task instructions are not available, the instructions for the parent
 * challenge.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskInstructions extends Component {
  /**
   * Very basic mustache-tag replacement. The results need to be escaped, e.g.
   * via MarkdownContent component.
   */
  substitutePropertyTags(instructions) {
    if (!/{{/.test(instructions)) { // no tags present
      return instructions
    }

    const properties = AsMappableTask(this.props.task).allFeatureProperties()
    let substituted = instructions
    _keys(properties).forEach(key => {
      substituted = substituted.replace(RegExp(`{{\\s*${key}\\s*}}`, "g"), properties[key])
    })

    return substituted
  }

  render() {
    const taskInstructions = !_isEmpty(this.props.task.instruction) ?
                             this.props.task.instruction :
                             _get(this.props.task, 'parent.instruction')

    if (_isEmpty(taskInstructions)) {
      return null
    }

    return <MarkdownContent markdown={this.substitutePropertyTags(taskInstructions)} />
  }
}

TaskInstructions.propTypes = {
  task: PropTypes.object.isRequired,
}
