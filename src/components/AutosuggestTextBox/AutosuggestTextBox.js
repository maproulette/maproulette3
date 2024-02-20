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
import _concat from 'lodash/concat'
import Dropdown from '../Dropdown/Dropdown'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

export const FILTER_SEARCH_TEXT = -1
export const FILTER_SEARCH_ALL = -2

/**
 * AutosuggestTextBox combines a text input with a dropdown, executing a search
 * as characters are typed and presenting matching items in the dropdown for
 * selection.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class AutosuggestTextBox extends Component {
  state = {
    textBoxActive: false,
    highlightResult: -1
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

  handleKeyDown = (e, dropdown, downshift) => {
    // Ignore if modifier keys were pressed
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return
    }

    if (e.key === "Enter") {
      // Don't let enter key potentially submit a form
      e.preventDefault()
    }

    if (dropdown.isDropdownVisible) {
      const items = _concat(this.getPreferredResults(), this.getSearchResults())
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

  /**
   * Generates list of dropdown items from search results, or message indicating
   * there are no results.
   *
   * @private
   */
  dropdownItems(getItemProps) {
    const isChecked = (result) => {
      const isAllOption = result.id === FILTER_SEARCH_ALL

      if (this.props.multiselect) {
        const isItemSelected = this.props.multiselect.includes(result.id)
        const isPreferredTag = preferredResults.some((preferredResult) => preferredResult.id === result.id)

        if (!_isEmpty(preferredResults)) {
          return isPreferredTag && (this.props.multiselect.length === 0 || isItemSelected)
        } else {
          return this.props.multiselect.length === 0 ? isAllOption : isItemSelected
        }
      }

      return isAllOption
    }

    const generateResult = (result, className = "", index) => {
      if (this.state.highlightResult === index) {
        className += this.props.highlightClassName
      }

      return !_isEmpty(result) ? (
        <a
          {...getItemProps({
            key: this.props.resultKey(result),
            item: result,
            className: classNames(
              className,
              this.props.resultClassName ? this.props.resultClassName(result) : null
            ),
          })}
        >
          <div className="mr-flex mr-items-center">
            {this.props.multiselect && result.id !== FILTER_SEARCH_TEXT && (
              <input
                type="checkbox"
                className="mr-checkbox-toggle mr-mr-2"
                id={result.id}
                name={result.id}
                checked={isChecked(result)}
                readOnly
              />
            )}
            {this.props.resultLabel(result)}
          </div>
        </a>
      ) : null
    }

    let items = []
    const searchResults = this.getSearchResults()
    const preferredResults = this.getPreferredResults()

    // Filter preferredResults based on user input
    const filteredPreferredResults = preferredResults.filter((result) =>
      result.toLowerCase().includes(this.props.inputValue.toLowerCase())
    )

    searchResults.sort((a, b) => {
      if (a.id === FILTER_SEARCH_ALL) return -1
      if (b.id === FILTER_SEARCH_ALL) return 1
      if (a.name === this.props.inputValue) return -1
      if (b.name === this.props.inputValue) return 1
      return isChecked(b) - isChecked(a)
    })

    if (!_isEmpty(filteredPreferredResults)) {
      let className = "mr-font-medium"
      items = items.concat(
        _map(filteredPreferredResults, (result, index) => {
          // Add a border bottom to the last entry if there are more search results.
          if (index === filteredPreferredResults.length - 1 && filteredPreferredResults.length > 0) {
            className += " mr-border-b-2 mr-border-white-50 mr-mb-2 mr-pb-2"
          }
          return generateResult(result, className, index)
        })
      )
    }

    // Now concatenate all other search results, but the index will be offset by the preferred results length.
    items = items.concat(_map(searchResults, 
      (result, index) => generateResult(result, "", index + filteredPreferredResults.length)
    ))

    return items
  }

  getPreferredResults = () => {
    // Filter out any tags that have already been selected.
    const preferredResults = _clone(this.props.preferredResults) || []
    return _difference(preferredResults, _split(this.props.formData, ','))
  }

  getSearchResults = () => {
    // If we are limiting tags to just preferred we don't need to provide any search results
    if (this.props.limitToPreferred) {
      return []
    }

    // Filter out any of our original preferredResults tags so they don't show in the list twice.
    return _filter(this.props.searchResults, t => _indexOf(this.props.preferredResults, t.name) === -1)
  }

  render() {
    return (
      <Downshift
        {...this.props}
        onInputValueChange={this.inputChanged}
        onChange={this.onChange}
        itemToString={result => result ? this.props.resultLabel(result) : ''}
      >
        {downshift => {
          const openOnFocus = this.props.openOnFocus ||
                              _get(this.props.preferredResults, 'length', 0) > 0
          const resultItems = this.dropdownItems(downshift.getItemProps, downshift.inputValue)
          const show = this.state.textBoxActive || (downshift.isOpen && downshift.inputValue.length > 0)

          return (
            <Dropdown
              className="mr-w-full mr-dropdown--flush"
              innerClassName={this.props.dropdownInnerClassName}
              rootProps={downshift.getRootProps({}, {suppressRefError: true})}
              suppressControls
              fixedMenu={this.props.fixedMenu}
              isVisible={Boolean(show)}
              toggleVisible={() => this.setState({highlightResult: -1})}
              dropdownButton={dropdown => (
                <input
                  {...downshift.getInputProps()}
                  className={classNames(
                    this.props.inputClassName,
                    "mr-flex-grow mr-w-full mr-h-full mr-outline-none"
                  )}
                  onKeyDown={(e) => this.handleKeyDown(e, dropdown, downshift)}
                  onFocus={() => this.setState({textBoxActive: openOnFocus})}
                  onBlur={() => this.setState({textBoxActive: false})}
                  placeholder={this.props.placeholder}
                />
              )}
              dropdownContent={() => {
                if (this.props.isSearching) {
                  return (
                    <div
                      {...downshift.getMenuProps({
                        className: "mr-flex mr-justify-center mr-items-center mr-my-4 mr-w-full"
                      })}
                    >
                      <BusySpinner />
                    </div>
                  )
                }

                return (
                  <div {...downshift.getMenuProps({className: "mr-link-list mr-links-inverse"})}>
                    {resultItems}
                    {(resultItems.length === 0 || this.props.showNoResults) &&
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
  /** ClassNames for highlighting on arrow keys */
  highlightClassName: PropTypes.string,
}

AutosuggestTextBox.defaultProps = {
  allowNew: false,
  highlightClassName: " mr-bg-blue-darker mr-font-bold",
}
