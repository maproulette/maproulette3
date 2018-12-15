import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './LoadMoreButton.css'


/**
 * LoadMoreButton renders a 'load more' button that can be used
 * to show more results.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class LoadMoreButton extends Component {
  render() {
    if (!this.props.hasMoreResults && !this.props.isLoading) {
      return null
    }

    return (
      <button className={classNames("button is-outlined load-more-button",
                                    this.props.className,
                                    {"is-loading": this.props.isLoading,
                                     "no-focus": !this.props.isLoading})}
              onClick={(e) => {
                e.preventDefault()
                this.props.loadMore()
              }}>
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
