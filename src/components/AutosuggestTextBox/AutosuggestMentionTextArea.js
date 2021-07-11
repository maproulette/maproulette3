import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import Downshift from 'downshift'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _differenceBy from 'lodash/differenceBy'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'
import _concat from 'lodash/concat'
import Dropdown from '../Dropdown/Dropdown'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

/**
 * AutosuggestMentionTextArea combines a text area with a dropdown, executing a search
 * when the @ character is typed.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class AutosuggestMentionTextArea extends Component {
  state = {
    textBoxActive: false,
    showSuggestions: false,
    highlightResult: -1
  }

  inputChanged = (inputText, downshift) => {
    const searchOn = this.findMatch(inputText,
      _get(this.props.inputRef, 'current.selectionStart'))
    if (searchOn !== undefined && searchOn !== null) {
      this.props.search(searchOn)
      this.setState({showSuggestions: true})
    }
    else if (this.state.showSuggestions) {
      this.setState({showSuggestions: false})
    }

    // inputChanged() gets called with the item if an item is
    // selected and also when our textarea goes out of focus it is
    // called with "". We need to make sure we don't register those
    // changes thereby messing up our textarea value.
    if (this.props.onInputValueChange && !downshift.selectedItem &&
        this.state.textBoxActive) {
      this.props.onInputValueChange(inputText)
    }
  }

  onChange = (item, downshift) => {
    // Downshift does not automatically clear the selected menu item when it's
    // chosen, so we need to do so ourselves. Otherwise if the user clicks off
    // the component later, Downshift could choose to re-add the selected item.
    // Note that this clearing will result in another call to onChange with a
    // null item
    if (item && downshift.selectedItem) {
      downshift.clearSelection()
      const cursor = _get(this.props.inputRef, 'current.selectionStart')
      const newValue = this.replaceMatch(this.props.inputValue, item.displayName, cursor)
      this.props.onInputValueChange(newValue)
    }
  }

  handleKeyDown = (e, dropdown, downshift) => {
    if (dropdown.isDropdownVisible) {
      if (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowLeft" ||
          e.key === "Enter") {
        e.preventDefault()
      }

      const items = _concat(this.props.preferredResults, this.getSearchResults())
      const itemsLength = _get(items, 'length', 0)

      if (e.key === "Enter") {
        downshift.selectItem(items[this.state.highlightResult])
        this.setState({highlightResult: -1})
      }
      else if (e.key === "ArrowDown") {
        if (this.state.highlightResult < (itemsLength - 1)) {
          this.setState({highlightResult: (this.state.highlightResult + 1) })
        }
      }
      else if (e.key === "ArrowUp" && this.state.highlightResult > -1) {
        if (this.state.highlightResult > 0) {
          this.setState({highlightResult: (this.state.highlightResult - 1) })
        }
      }
    }
  }


  regex = searchString => {
    return searchString.match(/^()@([\w]*)$/)  || // match "@..."
           searchString.match(/([^[])@([\w]*)$/) ||  // match "hi @..."
           searchString.match(/(\[)@([^\]]*)$/)  // match "[@...]"
  }

  findMatch = (input, cursorPosition) => {
    const searchString = input.substring(0, cursorPosition)
    const searchMatch = this.regex(searchString)

    if (searchMatch) {
      return searchMatch[2]
    }

    return null
  }

  replaceMatch = (input, selectedValue, cursorPosition) => {
    const searchString = input.substring(0, cursorPosition)
    const searchMatch = this.regex(searchString)

    if (searchMatch) {
      // If we matched a character before our @ that was not a [ we need
      // to bump the index to leave it when we replace.
      const index = searchMatch[1] && searchMatch[1] !== "[" ?
        searchMatch.index + 1 : searchMatch.index

      return [input.slice(0, index),
              "[@", selectedValue, "]",
              input.slice(cursorPosition)].join('')
    }
  }

  /**
   * Generates list of dropdown items from search results, or message indicating
   * there are no results.
   *
   * @private
   */
  dropdownItems(getItemProps, inputValue) {
    const generateResult = (result, className = "", index) => {
      if (this.state.highlightResult === index) {
        className += this.props.highlightClassName
      }
      return (
        <a
          {...getItemProps({
            key: this.props.resultKey(result),
            item: result,
            className: classNames(
              className ? className :
              (this.props.resultClassName ? this.props.resultClassName(result) : null)
            ),
          })}
        >
          {this.props.resultLabel(result)}
        </a>
      )
    }

    let items = []
    const searchResults = this.getSearchResults()
    const preferredResults = this.props.preferredResults
    if (!_isEmpty(preferredResults)) {
      let className = "mr-font-medium"
      items = items.concat(_map(preferredResults,
        (result, index) => {
          // Add a border bottom to the last entry if there are more
          // search results.
          if (index === preferredResults.length - 1 && searchResults.length > 0) {
            className += " mr-border-b-2 mr-border-white-50 mr-mb-2 mr-pb-2"
          }
          return generateResult(result, className, index)
        }))
    }

    // Now concat all other search results -- but the index will be offset by the
    // preferred results length
    items = items.concat(_map(searchResults,
      (result, index) => generateResult(result, "", index + preferredResults.length)))
    return items
  }

  getSearchResults = () => {
    // Filter out any of our original preferredResults so they don't show
    // in the list twice.
    return _differenceBy(this.props.searchResults,
                         this.props.preferredResults,
                         'displayName')
  }

  render() {
    return (
      <Downshift
        {..._omit(this.props, ['ref'])}
        onInputValueChange={this.inputChanged}
        onChange={this.onChange}
        itemToString={result => result ? this.props.resultLabel(result) : ''}
      >
        {downshift => {
          const searchOn = this.findMatch(downshift.inputValue,
            _get(this.props.inputRef, 'current.selectionStart'))
          const resultItems = (searchOn !== undefined && searchOn !== null) ?
            this.dropdownItems(downshift.getItemProps, searchOn) : null

          const show = this.state.showSuggestions && resultItems

          return (
            <Dropdown
              className="mr-w-full mr-dropdown--flush"
              wrapperClassName="mr-w-full"
              innerClassName={this.props.dropdownInnerClassName}
              rootProps={downshift.getRootProps({}, {suppressRefError: true})}
              suppressControls
              isVisible={Boolean(show)}
              placement={this.props.dropdownPlacement || "bottom-start"}
              toggleVisible={() => _noop}
              dropdownButton={dropdown => (
                <textarea
                  {...downshift.getInputProps()}
                  ref={this.props.inputRef}
                  className={classNames(
                    this.props.inputClassName,
                    "mr-flex-grow mr-w-full mr-h-full mr-outline-none",
                    this.props.disableResize ? "mr-resize-none" : "mr-resize"
                  )}
                  onKeyDown={(e) => this.handleKeyDown(e, dropdown, downshift)}
                  onFocus={(e) => this.setState({textBoxActive: true})}
                  onBlur={(e) => this.setState({textBoxActive: false})}
                  placeholder={this.props.placeholder}
                  rows={this.props.rows}
                  cols={this.props.cols}
                />
              )}
              dropdownContent={() => {
                if (this.props.isSearching) {
                  return (
                    <div
                      {...downshift.getMenuProps({
                        className: "mr-flex mr-justify-center mr-items-center mr-my-4"
                      })}
                    >
                      <BusySpinner />
                    </div>
                  )
                }

                return (
                  <div {...downshift.getMenuProps({className: "mr-link-list mr-links-inverse"})}>
                    {resultItems}
                    {(resultItems?.length === 0 || this.props.showNoResults) &&
                    <div className="mr-text-grey-lighter mr-p-4 mr-text-sm">
                      <FormattedMessage {...messages.noResults} />
                    </div>
                    }
                  </div>
                )
              }}
            />
          )
        }}
      </Downshift>
    )
  }
}

AutosuggestMentionTextArea.propTypes = {
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
  /** ClassNames for highlighting on arrow keys */
  highlightClassName: PropTypes.string,
}

AutosuggestMentionTextArea.defaultProps = {
  allowNew: false,
  highlightClassName: " mr-bg-blue-darker mr-font-bold"
}
