import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import Downshift from 'downshift'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _split from 'lodash/split'
import _difference from 'lodash/difference'
import _clone from 'lodash/clone'
import _indexOf from 'lodash/indexOf'
import _filter from 'lodash/filter'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'
import './AutosuggestTextBox.scss'

/**
 * AutosuggestTextBox combines a text input with a dropdown, executing a search
 * as characters are typed and presenting matching items in the dropdown for
 * selection.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AutosuggestTextBox extends Component {
  state = {
    textBoxActive: false
  }

  inputChanged = inputText => {
    this.props.search(inputText)

    if (this.props.onInputValueChange) {
      this.props.onInputValueChange(inputText)
    }
  }

  onChange = (item, downshift) => {
    if (this.props.onChange) {
      this.props.onChange(item, downshift)
    }

    // Downshift does not automatically clear the selected menu item when it's
    // chosen, so we need to do so ourselves. Otherwise if the user clicks off
    // the component later, Downshift could choose to re-add the selected item.
    // Note that this clearing will result in another call to onChange with a
    // null item
    if (item && downshift.selectedItem) {
      downshift.clearSelection()
    }
  }

  handleKeyDown = e => {
    if (e.key === "Enter") {
      // Don't let enter key potentially submit a form
      e.preventDefault()
    }
  }

  /**
   * Generates list of dropdown items from search results, or message indicating
   * there are no results.
   *
   * @private
   */
  dropdownItems(getItemProps, inputValue) {
    const generateResult = (result, className = "") => (
      <a {...getItemProps({
        key: this.props.resultKey(result),
        item: result,
        className: classNames("dropdown-item", className ? className :
                              (this.props.resultClassName ?
                                this.props.resultClassName(result) :
                                null)),
      })}>
        {this.props.resultLabel(result)}
      </a>
    )

    let items = []
    const preferredResults = this.getPreferredResults()
    if (!_isEmpty(preferredResults)) {
      let className = "mr-font-medium"
      items = items.concat(_map(preferredResults,
        (result, index) => {
          // Add a border bottom to the last entry if there are more
          // search results.
          if (index === preferredResults.length - 1) {
            className += " mr-border-b-2 mr-border-grey-lighter mr-mb-2 mr-pb-2"
          }
          return generateResult(result, className)
        }))
    }

    items = items.concat(_map(this.getSearchResults(), generateResult))
    return items
  }

  getPreferredResults = () => {
    // Filter out any tags that have already been selected.
    const preferredResults = _clone(this.props.preferredResults) || []
    return _difference(preferredResults, _split(this.props.formData, ','))
  }

  getSearchResults = () => {
    // Filter out any of our original preferredResults tags so they don't show
    // in the list twice.
    return _filter(this.props.searchResults,
                   t => _indexOf(this.props.preferredResults, t.name) === -1)

  }

  render() {
    return (
      <Downshift {...this.props}
                 onInputValueChange={this.inputChanged}
                 onChange={this.onChange}
                 itemToString={result => result ? this.props.resultLabel(result) : ''}>
        {({getInputProps, getItemProps, getMenuProps, isOpen, inputValue}) => {
          const openOnFocus = _get(this.props.preferredResults, 'length', 0) > 0
          const resultItems = this.dropdownItems(getItemProps, inputValue)
          const show = this.state.textBoxActive || (isOpen && inputValue.length > 0)

          return (
            <div className={classNames("dropdown autosuggest-text-box",
                                      {"is-active": show})}>
              <div className="autosuggest-text-box__input-wrapper">
                <input {...getInputProps()}
                       className={classNames(this.props.inputClassName, "mr-h-full mr-outline-none")}
                       onKeyDown={this.handleKeyDown}
                       onFocus={(e) => this.setState({textBoxActive: openOnFocus})}
                       onBlur={(e) => this.setState({textBoxActive: false})}
                       placeholder={this.props.placeholder}
                />
                {this.props.isSearching && <BusySpinner inline />}
              </div>
              <div className="dropdown-menu">
                <div {...getMenuProps({
                  className: classNames("dropdown-content", {"dropdown-content--fixed": this.props.fixedMenu}),
                })}>
                  {resultItems}
                  {(resultItems.length === 0 || this.props.showNoResults) &&
                  <div className="autosuggest-text-box__no-results">
                    <FormattedMessage {...messages.noResults} />
                  </div>
                  }
                </div>
              </div>
            </div>
          )
        }}
      </Downshift>
    )
  }
}

AutosuggestTextBox.propTypes = {
  /** Executed to perform search of input content */
  search: PropTypes.func.isRequired,
  /** Busy spinner will be shown while set to true */
  isSearching: PropTypes.bool,
  /** Array of search results matching input */
  searchResults: PropTypes.array,
  /** Function to provide display string for single result */
  resultLabel: PropTypes.func.isRequired,
  /** Function to provide key for single result */
  resultKey: PropTypes.func.isRequired,
  /** Invoked when user selects an item */
  onChange: PropTypes.func,
  /** Pre-formatted placeholder for text input */
  placeholder: PropTypes.string,
  /** Invoked when input text is modified, passing new text */
  onInputValueChange: PropTypes.func,
  /** Set to true to allow user to create new items */
  allowNew: PropTypes.bool,
  /** Array of preferred matches that should be shown first */
  preferredResults: PropTypes.array,
}

AutosuggestTextBox.defaultProps = {
  allowNew: false,
}
