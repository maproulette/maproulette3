import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import './QuickTextBox.css'

export default class QuickTextBox extends Component {
  /**
   * Esc signals cancellation, Enter signals completion.
   *
   * @private
   */
  checkForSpecialKeys = (e) => {
    if (e.key === "Escape") {
      this.props.cancel()
    }
    else if (e.key === "Enter") {
      this.props.done()
    }
  }

  render() {
    return (
      <div className={classNames('quick-text-box', this.props.className)}>
        <div className='control-wrapper'>
          <input type="text"
                  className="input is-medium quick-text-box__input"
                  placeholder={this.props.placeholder}
                  maxLength="50"
                  onChange={(e) => this.props.setText(e.target.value)}
                  onKeyDown={this.checkForSpecialKeys}
                  value={this.props.text || ''} />
        </div>

        <button className="button has-svg-icon quick-text-box__done-button"
                onClick={this.props.done}>
          <SvgSymbol viewBox='0 0 20 20' sym="check-icon"/>
        </button>

        <button className="button has-svg-icon quick-text-box__cancel-button"
                onClick={this.props.cancel}>
          <SvgSymbol viewBox='0 0 20 20' sym="cancel-icon"/>
        </button>
      </div>
    )
  }
}

QuickTextBox.propTypes = {
  /** The current text */
  text: PropTypes.string.isRequired,
  /** Invoked when the user modifies the text */
  setText: PropTypes.func.isRequired,
  /** Invoked if user completes editing */
  done: PropTypes.func.isRequired,
  /** Invoked if user cancels editing */
  cancel: PropTypes.func.isRequired,
  /** Placeholder text */
  placeHolder: PropTypes.string,
}
