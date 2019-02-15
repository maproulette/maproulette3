import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import BusySpinner from '../BusySpinner/BusySpinner'
import './LoadMoreButton.scss'


/**
 * LoadMoreButton renders a 'load more' button that can be used
 * to show more results.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class LoadMoreButton extends Component {
  render() {
    if (this.props.isLoading) {
      return <BusySpinner />
    }
    else if (!this.props.hasMoreResults) {
      return null
    }

    return (
      <button
        className={classNames("mr-button", this.props.className)}
        onClick={e => {
          e.preventDefault()
          this.props.loadMore()
        }}
      >
        {this.props.children}
      </button>
    )
  }
}

LoadMoreButton.propTypes = {
  /** Invoked to show more results when the button is clicked */
  loadMore: PropTypes.func.isRequired,
  /** Boolean flag indicating if there are more results */
  hasMoreResults: PropTypes.bool,
  /** Boolean flag indicating we should show a busy spinner */
  isLoading: PropTypes.bool,
}
