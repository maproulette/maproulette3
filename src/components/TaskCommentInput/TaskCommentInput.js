import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import messages from  './Messages'
import './TaskCommentInput.scss'

/**
 * TaskCommentInput renders an unmanaged input for allowing users to add an
 * optional comment to a task when completing it
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskCommentInput extends Component {
  handleChange = e => {
    this.props.commentChanged(e.target.value)
  }

  render() {
    return (
      <div className="mr-pr-4 mr-mt-2">
        <textarea
          className="mr-input mr-input--green-lighter-outline"
          rows="1"
          cols="1"
          placeholder={this.props.intl.formatMessage(messages.placeholder)}
          value={this.props.value}
          onChange={this.handleChange}
        />
        {this.props.submitComment &&
         <div className="mr-my-1 mr-flex mr-justify-end">
           <button
             className="mr-button mr-button--link"
             onClick={this.props.submitComment}
           >
             <FormattedMessage {...messages.submitCommentLabel} />
           </button>
         </div>
        }
      </div>
    )
  }
}

TaskCommentInput.propTypes = {
  value: PropTypes.string,
  commentChanged: PropTypes.func.isRequired,
  submitComment: PropTypes.func,
}

TaskCommentInput.defaultProps = {
  value: "",
}

export default injectIntl(TaskCommentInput)
