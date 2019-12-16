import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import _isFunction from 'lodash/isFunction'
import _get from 'lodash/get'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import SearchTypeFilter from '../SearchTypeFilter/SearchTypeFilter'
import './SearchBox.scss'

/**
 * SearchBox UI component that presents an unmanaged text input for entering
 * search text. A live search is executed as the user types, and a
 * busy spinner displayed while a search is executing. The search box also
 * presents a control for clearing the search text once text is entered
 * (pressing ESC also clears the search text).
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class SearchBox extends Component {
  /**
   * Esc clears search, Enter signals completion
   *
   * @private
   */
  checkForSpecialKeys = (e) => {
    if (e.key === "Escape") {
      this.props.clearSearch()
    }
    else if (e.key === "Enter" && _isFunction(this.props.deactivate)) {
      this.props.deactivate()
    }
  }

  /**
   * @private
   */
  queryChanged = (e) => {
    this.props.setSearch(e.target.value, this.getSearchType(this.props))
  }

  getSearchType(props) {
    return _get(props, 'searchFilters.searchType')
  }

  getQuery(props) {
    return (props.searchGroup ?
        _get(props, `searchQueries.${props.searchGroup}.searchQuery.query`) :
        _get(props, 'searchQuery.query')) || ''
  }

  render() {
    const query = (this.props.searchGroup ?
      _get(this.props, `searchQueries.${this.props.searchGroup}.searchQuery.query`) :
      _get(this.props, 'searchQuery.query')) || ''
    const isLoading = _get(this.props, 'searchQuery.meta.fetchingResults')

    const clearButton =
      query.length === 0 ? null :
      <button className="search-box--clear-button delete" aria-label="delete"
              onClick={this.props.clearSearch} />

    const doneButton =
      (this.props.showDoneButton !== true || query.length === 0) ?
      null :
      <button className="button is-clear has-svg-icon search-box--done-button"
              onClick={() => this.props.deactivate && this.props.deactivate()}>
        <SvgSymbol
          className={this.props.buttonClassName}
          viewBox='0 0 20 20'
          sym="outline-arrow-right-icon"
        />
      </button>


    return (
      <div
        role="search"
        className={classNames(
          "mr-flex mr-items-center", {
            "lg:ml-ml-6 xl:mr-ml-12": !this.props.leftAligned
          },
          this.props.className
        )}
      >
        <label className="mr-mr-2" htmlFor="input-search">
          {!isLoading && !this.props.suppressIcon &&
           <SvgSymbol
             sym="search-icon"
             title="Search"
             viewBox="0 0 20 20"
             className="mr-fill-current mr-w-5 mr-h-5"
           />
          }
          {isLoading && <BusySpinner inline />}
        </label>
        <input
          type="text"
          className={classNames("mr-appearance-none mr-w-full mr-bg-transparent mr-outline-none mr-shadow-none mr-rounded-none", this.props.inputClassName)}
          placeholder={this.props.placeholder}
          maxLength="63"
          onChange={this.queryChanged}
          onKeyDown={this.checkForSpecialKeys}
          value={query}
        />

        {doneButton}
        {clearButton}
        {this.props.showSearchTypeFilter &&
          <SearchTypeFilter {...this.props} />
        }
      </div>
    )
  }
}

SearchBox.propTypes = {
  /** Invoked when the user modifies the search text */
  setSearch: PropTypes.func.isRequired,
  /** Invoked when the user clears the search text */
  clearSearch: PropTypes.func.isRequired,
  /** Invoked if user explicitly signals completion of search */
  deactivate: PropTypes.func,
  /** The current raw query string plus meta info */
  searchQuery: PropTypes.shape({
    query: PropTypes.string,
  }).isRequired,
  /** if true then will show a done button if query string is present */
  showDoneButton: PropTypes.bool,
  /** When false will not show the search icon */
  suppressIcon: PropTypes.bool,
  /** Placeholder text in search box */
  placeHolder: PropTypes.string,

}

SearchBox.defaultProps = {
  searchQuery: {},
}
