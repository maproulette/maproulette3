import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import Downshift from 'downshift'
import _map from 'lodash/map'
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
    return _map(this.props.searchResults, result => (
             <a {...getItemProps({
               key: this.props.resultKey(result),
               item: result,
               className: classNames("dropdown-item", this.props.resultClassName ?
                                                      this.props.resultClassName(result) :
                                                      null),
             })}>
               {this.props.resultLabel(result)}
             </a>
           ))
  }

  render() {
    return (
      <Downshift {...this.props}
                 onInputValueChange={this.inputChanged}
                 onChange={this.onChange}
                 itemToString={result => result ? this.props.resultLabel(result) : ''}>
        {({getInputProps, getItemProps, getMenuProps, isOpen, inputValue}) => {
          const resultItems = this.dropdownItems(getItemProps, inputValue)
          return (
            <div className={classNames("dropdown autosuggest-text-box",
                                      {"is-active": isOpen && inputValue.length > 0})}>
              <div className="autosuggest-text-box__input-wrapper">
                <input {...getInputProps()}
                       className={classNames(this.props.inputClassName)}
                       onKeyDown={this.handleKeyDown}
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
}

AutosuggestTextBox.defaultProps = {
  allowNew: false,
}
