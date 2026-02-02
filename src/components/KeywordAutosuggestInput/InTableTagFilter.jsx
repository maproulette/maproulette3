import { Component } from "react";
import { FormattedMessage } from "react-intl";
import External from "../External/External";
import Modal from "../Modal/Modal";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import KeywordAutosuggestInput from "./KeywordAutosuggestInput";
import messages from "./Messages";

/**
 * Builds an input field with the KeywordAutosuggestInput onFocus
 * that works as in table column header filter.
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class InTableTagFilter extends Component {
  state = {
    showTagChooser: false,
    currentValue: null,
  };

  performSearch = () => {
    if (this.state.currentValue !== null) {
      this.props.onChange(this.state.currentValue);
    }
    this.setState({ showTagChooser: false, currentValue: null });
  };

  clearFilter = () => {
    this.setState({ currentValue: "" }, () => {
      this.props.onChange(this.state.currentValue);
    });
  };

  render() {
    // Default input style if none provided
    const defaultInputStyle =
      "mr-w-full mr-py-1 mr-px-3 mr-rounded-full mr-bg-green-950 mr-text-white mr-text-xs mr-border mr-border-green-600 mr-shadow-sm mr-outline-none hover:mr-border-green-500 mr-transition-colors mr-cursor-pointer";

    return (
      <div>
        <div className="mr-flex mr-items-center mr-pr-1 mr-gap-1">
          <input
            readOnly
            type="text"
            value={this.props.value}
            className={this.props.inputClassName || defaultInputStyle}
            placeholder={this.props.intl.formatMessage(messages.filterByTagsPlaceholder)}
            onFocus={() => {
              if (!this.state.showTagChooser) {
                this.setState({ showTagChooser: true });
              }
            }}
          />
          {this.props.value && (
            <button
              className="mr-text-white hover:mr-text-green-lighter mr-transition-colors mr-flex-shrink-0"
              onClick={this.clearFilter}
            >
              <SvgSymbol
                sym="icon-close"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-3 mr-h-3"
              />
            </button>
          )}
        </div>

        <External>
          <Modal isActive={this.state.showTagChooser} onClose={this.performSearch}>
            <div>
              <h3 className="mr-text-yellow mr-mb-6">
                <FormattedMessage {...messages.chooseTags} />
              </h3>
              <KeywordAutosuggestInput
                {...this.props}
                tagType={["tasks", "review"]}
                fixedMenu
                openOnFocus={this.state.showTagChooser}
                preferredResults={this.props.preferredTags}
                placeholder={this.props.intl.formatMessage(messages.filterTags)}
                handleChangeTags={(tags) => {
                  this.setState({ currentValue: tags });
                }}
                formData={
                  this.state.currentValue === null ? this.props.value : this.state.currentValue
                }
              />
              <button className="mr-button mr-block mr-mt-8 mr-mb-4" onClick={this.performSearch}>
                <FormattedMessage {...messages.search} />
              </button>
            </div>
          </Modal>
        </External>
      </div>
    );
  }
}
