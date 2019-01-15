import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Messages from  './Messages'
import './TaskCommentInput.scss'

/**
 * TaskCommentInput renders an unmanaged input for allowing users to add an
 * optional comment to a task when completing it.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskCommentInput extends Component {
  handleChange = (e) => {
    this.props.commentChanged(e.target.value)
  }

  render() {
    return (
      <div className={classNames("task-completion-comment", this.props.className)}>
        <input type="text" name="comment" value={this.props.value}
               placeholder={this.props.intl.formatMessage(Messages.placeholder)}
               onChange={this.handleChange} />
      </div>
    )
  }
}

TaskCommentInput.propTypes = {
  value: PropTypes.string,
  commentChanged: PropTypes.func.isRequired,
}

TaskCommentInput.defaultProps = {
  value: "",
}
