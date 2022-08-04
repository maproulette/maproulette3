import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

/**
 * SvgControl renders a simple clickable control consisting solely of the SVG
 * referenced by the sym prop.
 */
export default class SvgControl extends Component {
  render() {
    return (
      <div className={classNames("button icon-only", this.props.className)}
           onClick={this.props.onClick}>
        <span className="control-icon">
          <SvgSymbol sym={this.props.sym} viewBox={this.props.viewBox} />
        </span>
      </div>
    )
  }
}

SvgControl.propTypes = {
  sym: PropTypes.string.isRequired,
  viewBox: PropTypes.string,
  onClick: PropTypes.func,
}

SvgControl.defaultProps = {
  viewBox: "0 0 20 20",
}
