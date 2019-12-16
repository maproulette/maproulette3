import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import { injectIntl } from 'react-intl'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

export const SEARCH_TYPE_PROJECT = "projects"
export const SEARCH_TYPE_CHALLENGE = "challenges"

/**
 * SearchTypeFilter displays a dropdown containing options for name searching
 * by challenges or by projects.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class SearchTypeFilter extends Component {
  updateFilter = (value, closeDropdown) => {
    this.props.clearSearch()
    this.props.setSearchFilters({searchType: value})
    closeDropdown()
  }

  render() {
    const localizedSearchTypeLabels =
      {[SEARCH_TYPE_CHALLENGE]:
          this.props.intl.formatMessage(messages.searchTypeChallenge),
       [SEARCH_TYPE_PROJECT]:
          this.props.intl.formatMessage(messages.searchTypeProject)}
    const notFiltering = !this.props.searchFilters.searchType

    return (
      <Dropdown
        className="mr-dropdown--flush mr-p-6 mr-pl-0 mr-ml-4"
        dropdownButton={dropdown =>
          <div className="" onClick={dropdown.toggleDropdownVisible}>
            <span className="mr-flex mr-items-center mr-text-green-lighter mr-cursor-pointer">
              <span className="mr-w-20 mr-mr-2 mr-overflow-hidden mr-whitespace-no-wrap mr-overflow-ellipsis">
              {
                notFiltering ?
                localizedSearchTypeLabels.challenges :
                localizedSearchTypeLabels[this.props.searchFilters.searchType]
              }
              </span>
              <SvgSymbol
                sym="icon-cheveron-down"
                viewBox="0 0 20 20"
                className="mr-fill-current mr-w-5 mr-h-5"
              />
            </span>
          </div>
        }
        dropdownContent = {dropdown =>
          <ListSearchTypes
            searchTypeLabels={localizedSearchTypeLabels}
            updateFilter={this.updateFilter}
            closeDropdown={dropdown.closeDropdown}
          />
        }
      />
    )
  }
}

const ListSearchTypes = function(props) {
  const menuItems = _map(props.searchTypeLabels, (searchType, name) => (
    <li key={name}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a onClick={() => props.updateFilter(name, props.closeDropdown)}>
        {props.searchTypeLabels[name]}
      </a>
    </li>
  ))

  return (
    <ol className="mr-list-dropdown mr-list-dropdown--ruled">
      {menuItems}
    </ol>
  )
}

SearchTypeFilter.propTypes = {
  /** Invoked to update the challenge difficulty filter */
  setSearchFilters: PropTypes.func.isRequired,
  /** Invoked to clear the challenge difficulty filter */
  removeSearchFilters: PropTypes.func.isRequired,
  /** The current value of the search type filter */
  searchFilters: PropTypes.object,
}

SearchTypeFilter.defaultProps = {
  searchFilters: {},
}

export default injectIntl(SearchTypeFilter)
