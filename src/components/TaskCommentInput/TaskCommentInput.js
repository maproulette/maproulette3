import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
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
      <div className="mr-mt-2">
        <textarea
          className={classNames(
            "mr-appearance-none mr-outline-none mr-w-full mr-py-2 mr-px-4 mr-border-none mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner mr-w-full",
            this.props.className
          )}
          rows={this.props.rows}
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
  rows: 1,
}

export default injectIntl(TaskCommentInput)
