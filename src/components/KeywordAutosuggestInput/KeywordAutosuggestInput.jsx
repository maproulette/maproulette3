import { Component } from "react";
import { injectIntl } from "react-intl";
import AutosuggestTextBox from "../AutosuggestTextBox/AutosuggestTextBox";
import { TagsInputField } from "../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter";
import WithKeywordSearch from "../HOCs/WithKeywordSearch/WithKeywordSearch";
import messages from "./Messages";
import "./KeywordAutosuggestInput.scss";

/**
 * KeywordAutosuggestInput combines the AutosuggestTextBox component with the
 * TagsInputField component to provide tag-style text input with auto-suggestion.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class KeywordAutosuggestInput extends Component {
  state = {
    value: "",
  };

  keywordClassName = (keyword) => {
    return Number.isFinite(keyword.id) ? "existing-keyword" : "new-keyword";
  };

  /**
   * Custom input for TagsInputField. We use the AutosuggestTextBox here,
   * having it invoke the addTag prop (provided by TagsInputField) when a user
   * selects a keyword from the suggestions dropdown (onChange event).
   *
   * @private
   */
  autosuggestInput = (props) => {
    const placeholder =
      this.props.placeholder || this.props.intl.formatMessage(messages.addKeywordPlaceholder);

    return (
      <AutosuggestTextBox
        {...this.props}
        inputValue={this.state.value}
        inputClassName="mr-py-2 mr-px-4 mr-border-none mr-placeholder-white-50 mr-text-white mr-rounded mr-bg-black-15 mr-shadow-inner mr-w-full"
        onInputValueChange={(value) => this.setState({ value })}
        onChange={(keyword) => {
          if (keyword) {
            // We should not add the keyword if we are limiting tags to just preferred
            // and the keyword is not in the preferred list.
            if (!props.limitToPreferred || props.preferredResults.indexOf(keyword) >= 0) {
              if (this.props.handleAddTag) {
                this.props.handleAddTag(keyword.name || keyword);
              } else {
                props.addTag(keyword.name || keyword);
              }
            }
          }
          this.setState({ value: "" });
        }}
        resultClassName={this.keywordClassName}
        placeholder={placeholder}
      />
    );
  };

  handleChangeTags = (keyword) => {
    if (this.props.handleChangeTags) {
      this.props.handleChangeTags(keyword);
      this.setState({ value: "" });
    }
  };

  render() {
    if (this.props.handleChangeTags) {
      return (
        <TagsInputField
          {...this.props}
          onChange={this.handleChangeTags}
          renderInput={this.autosuggestInput}
          className="keyword-autosuggest-input dark-mode"
        />
      );
    } else {
      return (
        <TagsInputField
          {...this.props}
          renderInput={this.autosuggestInput}
          className="keyword-autosuggest-input dark-mode"
        />
      );
    }
  }
}

export default WithKeywordSearch(injectIntl(KeywordAutosuggestInput));
