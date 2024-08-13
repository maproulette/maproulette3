import { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * QuickTextBox renders a simple text input field with icon-only done/cancel
 * buttons, intended for quick one-off requests for text data in situations
 * where a whole form is overkill. It supports keyboard shortcuts Enter for
 * done and ESC for cancel.
 *
 * This is a controlled component, rendering the given text. If you have an
 * alternative done/cancel mechanism, you can set the suppressControls prop
 * to true and no buttons will be rendered.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class QuickTextBox extends Component {
  /**
   * Esc signals cancellation, Enter signals completion.
   *
   * @private
   */
  checkForSpecialKeys = (e) => {
    // Ignore if modifier keys were pressed
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return
    }
    else if (e.key === "Escape" && !this.props.suppressControls) {
      this.props.cancel()
    }
    else if (e.key === "Enter" && !this.props.suppressControls) {
      this.props.done()
    }
  }

  render() {
    return (
      <div className="mr-flex mr-items-center mr-justify-between">
        <div className="mr-flex mr-items-center mr-mr-2">
          <input
            autoFocus={this.props.autoFocus}
            type="text"
            className={classNames("mr-input mr-mr-2", this.props.inputClassName)}
            placeholder={this.props.placeholder}
            maxLength="50"
            onChange={(e) => this.props.setText(e.target.value)}
            onKeyDown={this.checkForSpecialKeys}
            value={this.props.text}
          />
          {!this.props.suppressControls &&
            <button
              className={classNames("mr-button", this.props.doneButtonClassName)}
              onClick={this.props.done}
            >
              {this.props.doneLabel || <FormattedMessage {...messages.saveLabel} />}
            </button>
          }
        </div>
        {!this.props.suppressControls &&
          <button
            className="mr-ml-4"
            onClick={this.props.cancel}
          >
            <SvgSymbol
              sym="icon-close"
              viewBox="0 0 20 20"
              className="mr-fill-white mr-w-4 mr-h-4"
              aria-hidden
            />
          </button>
        }
      </div>
    )
  }
}

QuickTextBox.propTypes = {
  /** The current text */
  text: PropTypes.string.isRequired,
  /** Invoked when the user modifies the text */
  setText: PropTypes.func.isRequired,
  /** Invoked if user completes editing, unless controls are suppressed */
  done: PropTypes.func,
  /** Invoked if user cancels editing, unless controls are suppressed */
  cancel: PropTypes.func,
  /** Placeholder text */
  placeHolder: PropTypes.string,
  /** Set to true for smaller size */
  small: PropTypes.bool,
  /** Set to true to suppress done/cancel button and keyboard controls */
  suppressControls: PropTypes.bool,
}

QuickTextBox.defaultProps = {
  small: false,
  suppressControls: false,
}
