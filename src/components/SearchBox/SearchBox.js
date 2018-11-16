import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isFunction from 'lodash/isFunction'
import _get from 'lodash/get'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import './SearchBox.css'

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
   * Esc clears search, Enter signals completion.
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
    this.props.setSearch(e.target.value)
  }

  render() {
    const query = _get(this.props, 'searchQuery.query') ||
                  _get(this.props, `searchQueries.${this.props.searchGroup}.searchQuery.query`)
                  || ''

    const clearButton =
      query.length === 0 ? null :
      <button className="search-box--clear-button delete" aria-label="delete"
              onClick={this.props.clearSearch} />

    const doneButton =
      (this.props.showDoneButton !== true || query.length === 0) ?
      null :
      <button className="button is-clear has-svg-icon search-box--done-button"
              onClick={() => this.props.deactivate && this.props.deactivate()}>
        <SvgSymbol viewBox='0 0 20 20' sym="outline-arrow-right-icon"/>
      </button>


    return (
      <div className={classNames('search-box', this.props.className)}>
        <div className='search-box__search-field'>
          <div className='control-wrapper'>
            {this.props.suppressIcon !== true &&
             <SvgSymbol viewBox='0 0 20 20' sym="search-icon" className="search-box__icon"/>
            }
            <div className={classNames('control', 'is-medium',
              {'is-loading': _get(this.props, 'searchQuery.meta.fetchingResults')})}
            >
              <input type="text"
                     className="input is-medium search-box__input"
                     placeholder={this.props.placeholder}
                     maxLength="63"
                     onChange={this.queryChanged}
                     onKeyDown={this.checkForSpecialKeys}
                     value={query} />
            </div>
          </div>
          {doneButton}
          {clearButton}
        </div>
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
