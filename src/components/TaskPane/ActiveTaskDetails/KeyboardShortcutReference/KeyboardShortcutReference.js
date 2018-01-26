import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import { map as _map,
         startCase as _startCase,
         omit as _omit } from 'lodash'
import Popout from '../../../Bulma/Popout'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './KeyboardShortcutReference.css'

/**
 * KeyboardShortcutReference renders a control that, when clicked, displays a
 * popout reference card for the given keyboard shortcuts.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class KeyboardShortcutReference extends Component {
  render() {
    const shortcuts = _map(this.props.activeKeyboardShortcuts, (value, operation) => [
      <dt key={`term-${operation}`}>{value.keyLabel || value.key}</dt>,
      <dd key={`def-${operation}`}>{value.label || _startCase(operation)}</dd>
    ])

    const popoutButton = (
      <button className={classNames("button active-task-details__keyboard-reference-control",
                                    {"icon-only": this.props.isMinimized,
                                     "is-clear": !this.props.isMinimized})}>
        <span className="control-icon"
              title={this.props.intl.formatMessage(messages.control)}>
          <SvgSymbol viewBox='0 0 20 20' sym="keyboard-icon" />
        </span>

        <span className="control-label">
          <FormattedMessage {...messages.keyboardShortcuts} />
        </span>
      </button>
    )

    return (
      <div className={classNames('active-task-details__keyboard-reference',
                                 this.props.className,
                                 {'is-minimized': this.props.isMinimized})}>
        {this.props.user &&
        <Popout direction={this.props.isMinimized ? 'right' : 'down'}
                className={classNames({
                  'is-minimized': this.props.isMinimized,
                  'is-center': !this.props.isMinimized
                })}
                control={popoutButton}
                {..._omit(this.props, 'className')}>
          <div className="popout-content__header active-task-details--bordered">
            <h3><FormattedMessage {...messages.keyboardShortcuts} /></h3>
          </div>

          <div className="popout-content__body">
            <dl className="keyboard-shortcuts">{shortcuts}</dl>
            <div className="is-clearfix" />
          </div>
        </Popout>
        }
      </div>
    )
  }
}

KeyboardShortcutReference.propTypes = {
  isMinimized: PropTypes.bool,
  activeKeyboardShortcuts: PropTypes.object,
}

KeyboardShortcutReference.defaultProps = {
  isMinimized: false,
}

export default injectIntl(KeyboardShortcutReference)
