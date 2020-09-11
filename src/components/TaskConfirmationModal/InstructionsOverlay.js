import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import TaskInstructions from '../TaskPane/TaskInstructions/TaskInstructions'
import messages from './Messages'

/**
 * InstructionsOverlay shows a box with the task instructions and will
 * record changes to the instructions form data
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class InstructionsOverlay extends Component {
  render() {
    return (
      <div className="mr-absolute mr-bottom-0 mr-left-0 mr-bg-blue-darker mr-w-full mr-h-112 mr-mt-32">
        <div className="mr-mt-4 mr-mx-4">
          <h4 className="mr-text-yellow mr-mb-2">
            <FormattedMessage {...messages.instructionsLabel} />
          </h4>
          <TaskInstructions {...this.props} inModal />
        </div>
        <div className="mr-w-full mr-text-center mr-absolute mr-bottom-0">
          <button
            onClick={() => this.props.close()}
            className="mr-button mr-w-4/5 mr-mb-8"
          >
            <FormattedMessage {...this.props.closeMessage} />
          </button>
        </div>
      </div>
    )
  }
}
