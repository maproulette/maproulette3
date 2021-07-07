import React, { useState } from "react";
import classNames from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";
import MarkdownContent from "../../MarkdownContent/MarkdownContent";
import AutosuggestMentionTextArea from "../../AutosuggestTextBox/AutosuggestMentionTextArea";
import WithOSMUserSearch from "../../HOCs/WithOSMUserSearch/WithOSMUserSearch";
import messages from "./Messages";

const CommentBox = WithOSMUserSearch(AutosuggestMentionTextArea);

/**
 *
 * @author [Jimmy Schwarzenberger](https://github.com/jschwarz2030)
 */
const ChallengeCommentInputInternal = (props) => {
  const [showingPreview, setShowingPreview] = useState(false);
  const characterCount = props.value.length;

  return (
    <div className="mr-mt-4">
      <div className="mr-flex mr-justify-between mr-mb-2 mr-leading-tight mr-text-xxs">
        <div className="mr-flex mr-items-center">
          <button
            className={classNames(
              "mr-pr-2 mr-mr-2 mr-border-r mr-border-green mr-uppercase mr-font-medium",
              showingPreview ? "mr-text-green-lighter" : "mr-text-white"
            )}
            onClick={() => setShowingPreview(false)}
          >
            <FormattedMessage {...messages.writeLabel} />
          </button>
          <button
            className={classNames(
              "mr-uppercase mr-font-medium",
              !showingPreview ? "mr-text-green-lighter" : "mr-text-white"
            )}
            onClick={() => this.setState({ showingPreview: true })}
          >
            <FormattedMessage {...messages.previewLabel} />
          </button>
        </div>
        <div
          className={classNames({
            "mr-text-dark-yellow":
              characterCount < props.maxCharacterCount &&
              characterCount > props.maxCharacterCount * 0.9,
            "mr-text-red-light": characterCount >= props.maxCharacterCount,
          })}
        >
          {characterCount}/{props.maxCharacterCount}
        </div>
      </div>
      {showingPreview ? (
        <div
          className={
            props.previewClassName
              ? props.previewClassName
              : "mr-border-2 mr-rounded mr-border-black-15 mr-px-2 mr-min-h-8"
          }
        >
          <MarkdownContent allowShortCodes markdown={props.value} />
        </div>
      ) : (
        <CommentBox
          inputRef={props.inputRef}
          rows={3}
          cols="1"
          inputValue={props.value}
          inputClassName={
            props.inputClassName
              ? props.inputClassName
              : "mr-appearance-none mr-outline-none mr-py-2 mr-px-4 mr-border-none mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner mr-w-full mr-font-mono mr-text-sm"
          }
          onInputValueChange={props.onChange}
          placeholder={props.intl.formatMessage(messages.placeholder)}
          fixedMenu
          taskId={props.taskId}
          disableResize
        />
      )}
      <div className="mr-my-1 mr-flex mr-justify-end">
        <button className="mr-button mr-button--link" onClick={props.onSubmit}>
          <FormattedMessage {...messages.submitCommentLabel} />
        </button>
      </div>
    </div>
  );
};

export const ChallengeCommentInput = injectIntl(ChallengeCommentInputInternal);
