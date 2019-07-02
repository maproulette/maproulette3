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

  handleComment = (event) => {
    this.props.setComment(event.target.value)
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

    return (
      <External>
        <Modal
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
                  className="mr-h-40 mr-max-w-40"
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
                  {this.props.inReview ?
                    <div
                      className={classNames(
                        "mr-uppercase mr-tracking-wide",
                        `mr-status-${_kebabCase(keysByReviewStatus[this.props.status])}`
                      )}
                    >
                      <FormattedMessage {...messagesByReviewStatus[this.props.status]} />
                    </div> :
                    <div
                      className={classNames(
                        "mr-uppercase mr-tracking-wide",
                        `mr-status-${_kebabCase(keysByStatus[this.props.status])}`
                      )}
                    >
                      <FormattedMessage {...messagesByStatus[this.props.status]} />
                    </div>
                  }

                  <div className="mr-mt-2">
                    <textarea
                      ref={this.commentInputRef}
                      className="mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-4 mr-mt-6"
                      rows={4}
                      cols="1"
                      placeholder={this.props.intl.formatMessage(messages.placeholder)}
                      value={this.props.comment}
                      onChange={this.handleComment}
                    />

                    <KeywordAutosuggestInput handleChangeTags={this.handleChangeTags}
                                         handleAddTag={this.handleAddTag}
                                         formData={this.props.tags} {...this.props}
                                         tagType={"tasks"} />

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
