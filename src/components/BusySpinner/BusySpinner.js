import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './BusySpinner.css'

/**
 * BusySpinner displays a simple busy spinner. By default it's shown centered
 * in a block, but the `inline` prop can be given to display it inline.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class BusySpinner extends Component {
  render() {
    return (
      <div className={classNames({'has-centered-children': this.props.inline !== true},
                                  'busy-spinner',
                                  this.props.className)}>
        <div className="busy-spinner-icon" />
      </div>
    )
  }
}

BusySpinner.propTypes = {
  /** display spinner inline, as opposed to a centered block */
  inline: PropTypes.bool,
}
