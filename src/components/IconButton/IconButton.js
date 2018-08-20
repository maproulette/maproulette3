import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

/**
 * Renders a simple SVG-only button using the given sprite name.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class IconButton extends Component {
  render() {
    return (
      <div className={classNames("button icon-only", this.props.className,
                                 {"is-small": this.props.small})}
           title={this.props.title}
           onClick={this.props.onClick}>
        <div className="control-icon">
          <SvgSymbol viewBox='0 0 20 20' sym={this.props.spriteName}
                     className={classNames({"is-primary": this.props.primary,
                                            "is-danger": this.props.danger})} />
        </div>
      </div>
    )
  }
}

IconButton.propTypes = {
  /** Name of the sprite SVG to render */
  spriteName: PropTypes.string.isRequired,
  /** Function to be invoked on click */
  onClick: PropTypes.func,
  /** Set to true for a small-sized SVG */
  small: PropTypes.bool,
  /** Set to true for primary-colored SVG */
  primary: PropTypes.bool,
  /** Set to true for danger-colored SVG */
  danger: PropTypes.bool,
}

IconButton.defaultProps = {
  small: false,
  primary: false,
  danger: false,
}
