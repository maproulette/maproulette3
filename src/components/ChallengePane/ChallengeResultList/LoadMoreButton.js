import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import { RESULTS_PER_PAGE } from '../../../services/Search/Search'
import './LoadMoreButton.css'
import messages from './Messages'


/**
 * LoadMoreButton renders a 'load more' button that can be used
 * to manage paging.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class LoadMoreButton extends Component {
  render() {
    if (!this.props.hasMoreResults) {
      return null
    }

    const resultsPerPage = _get(this.props, 'searchPage.resultsPerPage', RESULTS_PER_PAGE)
    const currentPage = _get(this.props, 'searchPage.currentPage', 0)

    return (
      <button className={classNames("button is-outlined load-more-button",
                                    this.props.className,
                                    {"is-loading": this.props.isLoading,
                                     "no-focus": !this.props.isLoading})}
              onClick={(e) => {
                e.preventDefault()
                this.props.setSearchPage({currentPage: (currentPage + 1), resultsPerPage})
              }}>
        <FormattedMessage {...messages.loadMoreLabel} />
      </button>
    )
  }
}

LoadMoreButton.propTypes = {
  /** Invoked to page the challenges when the button is clicked */
  setSearchPage: PropTypes.func.isRequired,
  /** Boolean flag indicating if there are more results */
  hasMoreResults: PropTypes.bool,
  /** Boolean flag indicating we should show a busy spinner */
  isLoading: PropTypes.bool,
}
