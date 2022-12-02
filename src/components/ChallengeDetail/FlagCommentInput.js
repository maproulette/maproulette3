import React, { Component } from "react";
import classNames from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";
import _get from "lodash/get";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import AutosuggestMentionTextArea from "../AutosuggestTextBox/AutosuggestMentionTextArea";
import messages from "./Messages";

export class FlagCommentInput extends Component {
  state = {
    showingPreview: false,
    characterCount: 0,
    value: '',
    checked: false,
    disabledButton: true
  };

  handleSubmit = () => {
    this.setState({ showingPreview: false });
    this.props.submitComment();
  };

  handleChange = (val) => {
    if (val.length <= 1000) {
      this.setState({ value: val });
      this.setState({ characterCount: _get(this.state.value, "length", 0) })
    }
  };

   handleToggle = () => {
    this.setState({checked: !this.state.checked})
    if(this.state.characterCount > 100){
      this.setState({disabledButton: !this.state.disabledButton})
    }
  };

  render() {
    const maxCharacterCount = 1000
    const minCharacterCount = 100
    return (
      <div className="mr-mt-2">
        <div className="mr-flex mr-justify-between mr-mb-2 mr-leading-tight mr-text-xxs">
          <div className="mr-flex mr-items-center">
            <button
              className={classNames(
                "mr-pr-2 mr-mr-2 mr-border-r mr-border-green mr-uppercase mr-font-medium",
                this.state.showingPreview
                  ? "mr-text-green-lighter"
                  : "mr-text-white"
              )}
              onClick={() => this.setState({ showingPreview: false })}
            >
              <FormattedMessage {...messages.write} />
            </button>
            <button
              className={classNames(
                "mr-uppercase mr-font-medium",
                !this.state.showingPreview
                  ? "mr-text-green-lighter"
                  : "mr-text-white"
              )}
              onClick={() => this.setState({ showingPreview: true })}
            >
              <FormattedMessage {...messages.preview} />
            </button>
          </div>
          <div
            className={classNames({
              "mr-text-dark-yellow":
                this.state.characterCount < maxCharacterCount &&
                this.state.characterCount > maxCharacterCount * 0.9,
              "mr-text-red-light":
                this.state.characterCount >= maxCharacterCount || this.state.characterCount < 100
            })}
          >
            {this.state.characterCount}/{maxCharacterCount}
          </div>
        </div>
        {this.state.showingPreview ? (
          <div
            className={
              this.props.previewClassName
                ? this.props.previewClassName
                : "mr-border-2 mr-rounded mr-border-black-15 mr-px-2 mr-min-h-8"
            }
          >
            <MarkdownContent allowShortCodes markdown={this.state.value} />
          </div>
        ) : (
          <AutosuggestMentionTextArea
            inputClassName="mr-appearance-none mr-outline-none mr-input mr-text-white mr-placeholder-medium mr-bg-grey-lighter-10 mr-border-none mr-shadow-inner mr-p-3 mr-font-mono mr-text-sm"
            previewClassName="mr-border-2 mr-rounded mr-border-grey-lighter-10 mr-p-2 mr-max-h-48 mr-overflow-y-scroll"
            rows={4}
            cols="1"
            inputValue={this.state.value}
            onInputValueChange={this.handleChange}
            placeholder='enter text here'
            disableResize={true}
          />
        )}
        <div className="form mr-flex mr-items-baseline">
          <input
            type="checkbox"
            className="mr-mr-2"
            checked={this.state.checked}
            onClick={this.handleToggle}
          />
          <label className="mr-text-white-50">
            <FormattedMessage {...messages.review} />
          </label>
        </div>
        <div className="mr-flex mr-items-center mr-mt-6">
          <button
            className="mr-button mr-button--white mr-mr-12 mr-px-8"
            onClick={this.handleSubmit}
            disabled={this.state.disabledButton}
          >
            <FormattedMessage {...messages.submitFlag} />
          </button>
        </div>
      </div>
    );
  }
}

export default injectIntl(FlagCommentInput);
