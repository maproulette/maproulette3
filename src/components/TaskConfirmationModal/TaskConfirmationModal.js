import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _kebabCase from 'lodash/kebabCase'
import { TaskStatus, messagesByStatus, keysByStatus }
       from '../../services/Task/TaskStatus/TaskStatus'
import { messagesByReviewStatus, keysByReviewStatus }
      from '../../services/Task/TaskReview/TaskReviewStatus'
import { TaskLoadMethod, messagesByLoadMethod }
       from '../../services/Task/TaskLoadMethod/TaskLoadMethod'
import TaskCommentInput from '../TaskCommentInput/TaskCommentInput'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import External from '../External/External'
import Modal from '../Modal/Modal'
import messages from './Messages'

export class TaskConfirmationModal extends Component {
  render() {
    const minimalConfirmation = this.props.inReview || this.props.needsRevised

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
                  this.props.needsRevised ?
                    <FormattedMessage {...messages.submitRevisionHeader} /> :
                    <FormattedMessage {...messages.header} />
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

              {this.props.status !== TaskStatus.skipped && !minimalConfirmation &&
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
              { !minimalConfirmation &&
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
