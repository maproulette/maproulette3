import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import AutosuggestMentionTextArea from '../AutosuggestTextBox/AutosuggestMentionTextArea'
import WithOSMUserSearch from '../HOCs/WithOSMUserSearch/WithOSMUserSearch'
import messages from  './Messages'

const CommentBox = WithOSMUserSearch(AutosuggestMentionTextArea)

/**
 * TaskCommentInput combines a textarea for commenting with an option to
 * preview their comment
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TaskCommentInput extends Component {
  state = {
    showingPreview: false,
  }

  handleSubmit = () => {
    this.setState({showingPreview: false})
    this.props.submitComment()
  }

  render() {
    return (
      <div className="mr-mt-2">
        <div className="mr-flex mr-items-center mr-mb-2 mr-leading-tight mr-text-xxs">
          <button
            className={classNames(
              "mr-pr-2 mr-mr-2 mr-border-r mr-border-green mr-uppercase mr-font-medium",
              this.state.showingPreview ? "mr-text-green-lighter" : "mr-text-white"
            )}
            onClick={() => this.setState({showingPreview: false})}
          >
            <FormattedMessage {...messages.writeLabel} />
          </button>
          <button
            className={classNames(
              "mr-uppercase mr-font-medium",
              !this.state.showingPreview ? "mr-text-green-lighter" : "mr-text-white"
            )}
            onClick={() => this.setState({showingPreview: true})}
          >
            <FormattedMessage {...messages.previewLabel} />
          </button>
        </div>
        {this.state.showingPreview ?
         <div
           className={
             this.props.previewClassName ?
             this.props.previewClassName :
             "mr-border-2 mr-rounded mr-border-black-15 mr-px-2 mr-min-h-8"
           }
         >
          <MarkdownContent allowShortCodes markdown={this.props.value} />
         </div> :
         <CommentBox
           inputRef={this.props.inputRef}
           rows={this.props.rows}
           cols="1"
           inputValue={this.props.value}
           inputClassName={
             this.props.inputClassName ?
             this.props.inputClassName :
             "mr-appearance-none mr-outline-none mr-py-2 mr-px-4 mr-border-none mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner mr-w-full mr-font-mono mr-text-sm"
           }
           onInputValueChange={(value) => this.props.commentChanged(value)}
           placeholder={this.props.intl.formatMessage(messages.placeholder)}
           fixedMenu
           taskId={this.props.taskId}
         />
        }
        {this.props.submitComment &&
         <div className="mr-my-1 mr-flex mr-justify-end">
           <button
             className="mr-button mr-button--link"
             onClick={this.handleSubmit}
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
