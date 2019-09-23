import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _kebabCase from 'lodash/kebabCase'
import _isUndefined from 'lodash/isUndefined'
import _pick from 'lodash/pick'
import _noop from 'lodash/noop'
import { TaskStatus, messagesByStatus, keysByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { needsReviewType } from '../../services/User/User'
import { messagesByReviewStatus, keysByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskLoadMethod, messagesByLoadMethod }
       from '../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { TaskReviewLoadMethod, messagesByReviewLoadMethod }
       from '../../services/Task/TaskReview/TaskReviewLoadMethod'
import { TaskReviewStatus } from '../../services/Task/TaskReview/TaskReviewStatus'
import TaskNearbyList from '../TaskPane/TaskNearbyList/TaskNearbyList'
import KeywordAutosuggestInput
       from '../KeywordAutosuggestInput/KeywordAutosuggestInput'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'

export class TaskConfirmationModal extends Component {
  commentInputRef = React.createRef()

  handleKeyboardShortcuts = event => {
    if (event.key ===
          this.props.keyboardShortcutGroups.taskCompletion.confirmSubmit.key &&
        event.shiftKey) {
      this.props.onConfirm()
      event.preventDefault()
    }
  }

  componentDidMount(prevProps, prevState) {
    this.commentInputRef.current.focus()

    this.props.activateKeyboardShortcut(
      'taskCompletion',
      _pick(this.props.keyboardShortcutGroups.taskCompletion, 'confirmSubmit'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcut('taskCompletion', 'confirmSubmit',
                                          this.handleKeyboardShortcuts)
  }

  handleAddTag = (value) => {
    this.props.setTags(!this.props.tags ? value : (this.props.tags + "," + value))
  }

  handleChangeTags = (value) => {
    this.props.setTags(value)
  }

  render() {
    const reviewConfirmation = this.props.inReview || !_isUndefined(this.props.needsRevised)
    const loadingNearby = this.props.loadBy === TaskLoadMethod.proximity
    const applyingSuggestedFix = this.props.task.suggestedFix && this.props.status === TaskStatus.fixed

    return (
      <External>
        <Modal
          contentClassName="mr-pb-6"
          wide={loadingNearby && !reviewConfirmation}
          narrow={!loadingNearby && !reviewConfirmation}
          medium={reviewConfirmation}
          isActive
          onClose={this.props.onCancel}
        >
          <div className={loadingNearby ? "mr-flex mr-justify-center" : ''}>
            <div className={classNames("mr-flex mr-justify-center",
                                       {"mr-pr-12": loadingNearby})}>
              <div className={classNames("mr-flex mr-flex-col mr-items-center",
                                         {"mr-max-w-88": !reviewConfirmation})}>
                <SvgSymbol
                  sym="illustration-choose"
                  viewBox="0 0 147 200"
                  className={applyingSuggestedFix ? "mr-h-30" : "mr-h-40"}
                />
                <div className="mr-w-full">
                  <h2 className="mr-text-grey-light-more mr-text-4xl mr-mt-4">
                    {this.props.inReview ?
                      <FormattedMessage {...messages.inReviewHeader} /> :
                      _isUndefined(this.props.needsRevised) ?
                        <FormattedMessage {...messages.header} /> :
                        (this.props.needsRevised === TaskReviewStatus.needed ?
                          <FormattedMessage {...messages.submitRevisionHeader} /> :
                          <FormattedMessage {...messages.disputeRevisionHeader} />)

                    }

                  </h2>
                  {this.props.inReview &&
                    <div
                      className={classNames(
                        "mr-uppercase mr-tracking-wide",
                        `mr-status-${_kebabCase(keysByReviewStatus[this.props.status])}`
                      )}
                    >
                      <FormattedMessage {...messagesByReviewStatus[this.props.status]} />
                    </div>
                  }
                  {!this.props.inReview && !applyingSuggestedFix &&
                    <div
                      className={classNames(
                        "mr-uppercase mr-tracking-wide",
                        `mr-status-${_kebabCase(keysByStatus[this.props.status])}`
                      )}
                    >
                      <FormattedMessage {...messagesByStatus[this.props.status]} />
                    </div>
                  }

                  {applyingSuggestedFix &&
                   <React.Fragment>
                     <p className="mr-my-4 mr-text-grey-light mr-text-sm">
                       <FormattedMessage
                         {...messages.osmUploadNotice }
                       />
                     </p>

                     <div className="mr-text-base mr-mt-2 mr-text-yellow">
                       <FormattedMessage {...messages.osmCommentHeader} />
                     </div>

                     <div>
                       <textarea
                         ref={this.commentInputRef}
                         className="mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-3 mr-mt-1"
                         rows={2}
                         cols="1"
                         value={this.props.osmComment}
                        onChange={e => this.props.setOSMComment(e.target.value)}
                       />
                     </div>
                   </React.Fragment>
                  }
                  {applyingSuggestedFix &&
                     <div className="mr-text-base mr-mt-4 mr-text-yellow">
                       <FormattedMessage {...messages.mrCommentHeader} />
                     </div>
                  }
                  <div className={classNames({"mr-mt-2": !applyingSuggestedFix})}>
                    <textarea
                      ref={this.commentInputRef}
                      className={classNames("mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-3", applyingSuggestedFix ? 'mr-mt-1' : 'mr-mt-6')}
                      rows={applyingSuggestedFix ? 2 : 4}
                      cols="1"
                      placeholder={applyingSuggestedFix ? '' : this.props.intl.formatMessage(messages.placeholder)}
                      value={this.props.comment}
                      onChange={e => this.props.setComment(e.target.value)}
                    />
                    <KeywordAutosuggestInput handleChangeTags={this.handleChangeTags}
                                         handleAddTag={this.handleAddTag}
                                         formData={this.props.tags} {...this.props}
                                         tagType={"tasks"}
                                         placeholder={this.props.intl.formatMessage(messages.addTagsPlaceholder)} />

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

                  {this.props.status !== TaskStatus.skipped && !reviewConfirmation &&
                    this.props.user.settings.needsReview !== needsReviewType.mandatory &&
                  <div className="form mr-mt-2 mr-flex mr-items-baseline">
                    <input
                      type="checkbox"
                      className="mr-mr-2"
                      checked={this.props.needsReview}
                      onClick={this.props.toggleNeedsReview}
                      onChange={_noop}
                    />
                    <label className="mr-text-white-50">
                      <FormattedMessage {...messages.reviewLabel} />
                    </label>
                  </div>
                  }

                  <div className="mr-flex mr-items-center mr-mt-8">
                    <button
                      className="mr-button mr-button--white mr-mr-12 mr-px-8"
                      onClick={this.props.onCancel}
                    >
                      <FormattedMessage {...messages.cancelLabel} />
                    </button>

                    <button
                      className="mr-button mr-px-8"
                      onClick={() => this.props.onConfirm()}
                    >
                      <FormattedMessage {...messages.submitLabel} />
                    </button>
                  </div>

                  { !reviewConfirmation &&
                    <div className="mr-mt-8">
                      <div className="form mr-flex mr-items-baseline">
                        <span className="mr-mr-4">
                          <FormattedMessage {...messages.loadByLabel} />
                        </span>
                        <input
                          type="radio"
                          name="randomnessPreference"
                          className="mr-mr-1"
                          checked={this.props.loadBy === TaskLoadMethod.random}
                          onClick={() => this.props.chooseLoadBy(TaskLoadMethod.random)}
                          onChange={_noop}
                        />
                        <label className="mr-ml-1 mr-mr-4">
                          <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.random]} />
                        </label>

                        <input
                          type="radio"
                          name="randomnessPreference"
                          className="mr-mr-1"
                          checked={this.props.loadBy === TaskLoadMethod.proximity}
                          onClick={() => this.props.chooseLoadBy(TaskLoadMethod.proximity)}
                          onChange={_noop}
                        />
                        <label className="mr-ml-1">
                          <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.proximity]} />
                        </label>
                      </div>
                    </div>
                  }

                  { reviewConfirmation && _isUndefined(this.props.needsRevised) &&
                    <div className="form mr-mt-8">
                        <span className="mr-mr-4">
                          <FormattedMessage {...messages.loadNextReviewLabel} />
                        </span>
                        <input
                          type="radio"
                          name="loadReviewPreference"
                          className="mr-mr-2"
                          checked={this.props.loadBy === TaskReviewLoadMethod.next}
                          onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.next)}
                          onChange={_noop}
                        />
                        <label className="mr-mr-4">
                          <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.next]} />
                        </label>
                        { this.props.fromInbox &&
                          <React.Fragment>
                            <input
                              type="radio"
                              name="loadReviewPreference"
                              className="mr-mr-2"
                              checked={this.props.loadBy === TaskReviewLoadMethod.inbox}
                              onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.inbox)}
                              onChange={_noop}
                            />
                            <label className="mr-mr-4">
                              <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.inbox]} />
                            </label>
                          </React.Fragment>
                        }
                        <input
                          type="radio"
                          name="loadReviewPreference"
                          className="mr-mr-2"
                          checked={this.props.loadBy === TaskReviewLoadMethod.all}
                          onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.all)}
                          onChange={_noop}
                        />
                        <label>
                          <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.all]} />
                        </label>
                    </div>
                  }

                  { reviewConfirmation && !_isUndefined(this.props.needsRevised) && this.props.fromInbox &&
                    <div className="form mr-mt-8">
                      <span className="mr-mr-4">
                        <FormattedMessage {...messages.loadNextReviewLabel} />
                      </span>
                      <input
                        type="radio"
                        name="loadReviewPreference"
                        className="mr-mr-2"
                        checked={this.props.loadBy === TaskReviewLoadMethod.inbox}
                        onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.inbox)}
                        onChange={_noop}
                      />
                      <label className="mr-mr-4">
                        <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.inbox]} />
                      </label>
                      <input
                        type="radio"
                        name="loadReviewPreference"
                        className="mr-mr-2"
                        checked={this.props.loadBy === TaskReviewLoadMethod.all}
                        onClick={() => this.props.chooseLoadBy(TaskReviewLoadMethod.all)}
                        onChange={_noop}
                      />
                      <label>
                        <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.all]} />
                      </label>
                    </div>
                  }
                </div>
              </div>
            </div>
            { loadingNearby &&
              <div>
                <h4 className="mr-my-6 mr-text-yellow mr-pl-12">
                  <FormattedMessage {...messages.nextNearbyLabel} />
                </h4>
                <div className="mr-border-l-2 mr-border-grey-lighter-10 mr-pl-12">
                  <div className="mr-h-112 mr-w-88">
                    <TaskNearbyList
                      {...this.props}
                      onTaskClick={this.props.chooseNextTask}
                      onMapClick={this.props.clearNextTask}
                      excludeSelfLockedTasks
                    />
                  </div>
                </div>
              </div>
            }
          </div>
        </Modal>
      </External>
    )
  }
}

export default TaskConfirmationModal
