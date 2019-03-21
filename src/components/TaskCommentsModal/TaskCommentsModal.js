import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import WithTaskComments from '../HOCs/WithTaskComments/WithTaskComments'
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import CommentList from '../CommentList/CommentList'
import External from '../External/External'
import Modal from '../Modal/Modal'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

export class TaskCommentsModal extends Component {
  state = {
    comment: ""
  }

  setComment = comment => this.setState({comment})

  postComment = () => {
    this.props.addTaskComment(this.props.taskId, this.state.comment)
    this.setComment("")
  }

  render() {
    return (
      <External>
        <Modal isActive={true} onClose={this.props.onClose}>
          {this.props.commentsLoading ?
           <BusySpinner /> :
           <div>
             <h2 className="mr-text-yellow mr-mb-6">
               <FormattedMessage {...messages.header} />
             </h2>
             <TaskCommentInput 
               rows={2}
               value={this.state.comment}
               commentChanged={this.setComment}
               submitComment={this.postComment}
             />
             <div className="mr-max-h-screen40 mr-overflow-y-scroll">
               <CommentList comments={this.props.comments} />
             </div>
           </div>
          }
        </Modal>
      </External>
    )
  }
}

TaskCommentsModal.propTypes = {
  taskId: PropTypes.number.isRequired,
}

export default WithTaskComments(TaskCommentsModal)
