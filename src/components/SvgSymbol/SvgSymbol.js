import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * SvgSymbol renders an svg that utilizes a <use> tag to reference the
 * _existing_ svg with an id matching the given sym prop on the current page
 * (in this app, SVGs are embeded in the page via the the Sprites component).
 *
 * @see See Sprites for a list of symbols
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class SvgSymbol extends Component {
  render() {
    return (
      <svg
        viewBox={this.props.viewBox}
        className={this.props.className}
        style={this.props.style}
        onClick={this.props.onClick}
      >
        {this.props.title && <title>{this.props.title}</title>}
        <use xlinkHref={'#' + this.props.sym} />
      </svg>
    )
  }
}

SvgSymbol.propTypes = {
  sym: PropTypes.string.isRequired,
  viewBox: PropTypes.string.isRequired,
  title: PropTypes.string,
}
