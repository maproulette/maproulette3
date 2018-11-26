import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { WidgetDataTarget, registerWidgetType }
       from '../../../services/Widget/Widget'
import TaskCommentInput from '../../TaskCommentInput/TaskCommentInput'
import CommentList from '../../CommentList/CommentList'
import QuickWidget from '../../QuickWidget/QuickWidget'
import messages from './Messages'

const descriptor = {
  widgetKey: 'TaskCommentsWidget',
  label: messages.label,
  targets: [WidgetDataTarget.task],
  minWidth: 3,
  defaultWidth: 3,
  minHeight: 3,
  defaultHeight: 6,
}

export default class TaskCommentsWidget extends Component {
  state = {
    comment: ""
  }

  setComment = comment => this.setState({comment})

  postComment = () => {
    this.props.postTaskComment(this.props.task, this.state.comment)
    this.setComment("")
  }

  render() {
    return (
      <QuickWidget
        {...this.props}
        className="task-comments-widget"
        widgetTitle={<FormattedMessage {...messages.title} />}
       >
        <TaskCommentInput 
          value={this.state.comment}
          commentChanged={this.setComment}
          submitComment={this.postComment}
        />
        <CommentList
          className="mr-px-4"
          comments={this.props.task.comments}
        />
      </QuickWidget>
    )
  }
}

TaskCommentsWidget.propTypes = {
  postTaskComment: PropTypes.func.isRequired,
}

registerWidgetType(TaskCommentsWidget, descriptor)
