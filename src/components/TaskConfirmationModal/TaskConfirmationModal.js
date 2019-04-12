import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _kebabCase from 'lodash/kebabCase'
import _isUndefined from 'lodash/isUndefined'
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
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'

export class TaskConfirmationModal extends Component {
  render() {
    const reviewConfirmation = this.props.inReview || !_isUndefined(this.props.needsRevised)

    return (
      <External>
        <Modal wide isActive onClose={this.props.onCancel}>
          <div className="mr-flex mr-justify-between">
            <div className="mr-pt-12">
              <SvgSymbol
                sym="illustration-choose"
                viewBox="0 0 147 200"
                className="mr-h-64 mr-mr-12 mr-max-w-40"
              />
            </div>
            <div className="mr-w-full">
              <h2 className="mr-text-yellow mr-text-4xl mr-mb-4">
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

              <TaskCommentInput
                className="mr-mt-6"
                rows={3}
                value={this.props.comment}
                commentChanged={this.props.setComment}
              />

              {this.props.status !== TaskStatus.skipped && !reviewConfirmation &&
                this.props.user.settings.needsReview !== needsReviewType.mandatory &&
              <div className="form mr-mt-2">
                <input
                  type="checkbox"
                  className="mr-mr-1"
                  checked={this.props.needsReview}
                  onChange={this.props.toggleNeedsReview}
                />
                <label>
                  <FormattedMessage {...messages.reviewLabel} />
                </label>
              </div>
              }
              { !reviewConfirmation &&
                <div className="form mr-mt-8 mr-border-grey-lighter-10 mr-border-t mr-border-b mr-py-4">
                  <span className="mr-mr-4">
                    <FormattedMessage {...messages.loadByLabel} />
                  </span>
                  <input
                    type="radio"
                    name="randomnessPreference"
                    className="mr-mr-1"
                    checked={this.props.loadBy === TaskLoadMethod.random}
                    onChange={() => this.props.chooseLoadBy(TaskLoadMethod.random)}
                  />
                  <label className="mr-mr-4">
                    <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.random]} />
                  </label>

                  <input
                    type="radio"
                    name="randomnessPreference"
                    className="mr-mr-1"
                    checked={this.props.loadBy === TaskLoadMethod.proximity}
                    onChange={() => this.props.chooseLoadBy(TaskLoadMethod.proximity)}
                  />
                  <label>
                    <FormattedMessage {...messagesByLoadMethod[TaskLoadMethod.proximity]} />
                  </label>
                </div>
              }

              { reviewConfirmation && _isUndefined(this.props.needsRevised) &&
                <div className="form mr-mt-8 mr-border-grey-lighter-10 mr-border-t mr-border-b mr-py-4">
                  <span className="mr-mr-4">
                    <FormattedMessage {...messages.loadNextReviewLabel} />
                  </span>
                  <input
                    type="radio"
                    name="loadReviewPreference"
                    className="mr-mr-1"
                    checked={this.props.loadBy === TaskReviewLoadMethod.next}
                    onChange={() => this.props.chooseLoadBy(TaskReviewLoadMethod.next)}
                  />
                  <label className="mr-mr-4">
                    <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.next]} />
                  </label>
                  { this.props.fromInbox &&
                    <React.Fragment>
                      <input
                        type="radio"
                        name="loadReviewPreference"
                        className="mr-mr-1"
                        checked={this.props.loadBy === TaskReviewLoadMethod.inbox}
                        onChange={() => this.props.chooseLoadBy(TaskReviewLoadMethod.inbox)}
                      />
                      <label className="mr-mr-4">
                        <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.inbox]} />
                      </label>
                    </React.Fragment>
                  }
                  <input
                    type="radio"
                    name="loadReviewPreference"
                    className="mr-mr-1"
                    checked={this.props.loadBy === TaskReviewLoadMethod.all}
                    onChange={() => this.props.chooseLoadBy(TaskReviewLoadMethod.all)}
                  />
                  <label>
                    <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.all]} />
                  </label>
                </div>
              }

              { reviewConfirmation && !_isUndefined(this.props.needsRevised) && this.props.fromInbox &&
                <div className="form mr-mt-8 mr-border-grey-lighter-10 mr-border-t mr-border-b mr-py-4">
                  <span className="mr-mr-4">
                    <FormattedMessage {...messages.loadNextReviewLabel} />
                  </span>
                  <input
                    type="radio"
                    name="loadReviewPreference"
                    className="mr-mr-1"
                    checked={this.props.loadBy === TaskReviewLoadMethod.inbox}
                    onChange={() => this.props.chooseLoadBy(TaskReviewLoadMethod.inbox)}
                  />
                  <label className="mr-mr-4">
                    <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.inbox]} />
                  </label>
                  <input
                    type="radio"
                    name="loadReviewPreference"
                    className="mr-mr-1"
                    checked={this.props.loadBy === TaskReviewLoadMethod.all}
                    onChange={() => this.props.chooseLoadBy(TaskReviewLoadMethod.all)}
                  />
                  <label>
                    <FormattedMessage {...messagesByReviewLoadMethod[TaskReviewLoadMethod.all]} />
                  </label>
                </div>
              }

              <div className="mr-flex mr-justify-end mr-items-center mr-mt-8">
                <button
                  className="mr-button mr-button--white mr-mr-4"
                  onClick={this.props.onCancel}
                >
                  <FormattedMessage {...messages.cancelLabel} />
                </button>

                <button
                  className="mr-button"
                  onClick={() => this.props.onConfirm()}
                >
                  <FormattedMessage {...messages.submitLabel} />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </External>
    )
  }
}


export default TaskConfirmationModal
