import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import './BusySpinner.scss'

/**
 * BusySpinner displays a simple busy spinner. By default it's shown centered
 * in a block, but the `inline` prop can be given to display it inline.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class BusySpinner extends Component {
  render() {
    return (
      <div className={classNames('busy-spinner', {
                                   'has-centered-children': this.props.inline !== true,
                                   'inline': this.props.inline,
                                 }, this.props.className)}>
        <SvgSymbol
          sym="spinner-icon"
          className={classNames("mr-w-5 mr-h-5",
                                {"mr-fill-green-lighter": !this.props.lightMode && !this.props.mapMode,
                                 "mr-fill-green-light": this.props.lightMode,
                                 "mr-fill-grey": this.props.mapMode})}
          viewBox="0 0 20 20"
        />
      </div>
    )
  }
}

BusySpinner.propTypes = {
  /** display spinner inline, as opposed to a centered block */
  inline: PropTypes.bool,
}
