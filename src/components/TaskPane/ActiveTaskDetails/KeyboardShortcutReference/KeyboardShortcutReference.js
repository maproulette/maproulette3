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
      <button className="button is-clear active-task-details__keyboard-reference-control">
        <span className="icon"
              title={this.props.intl.formatMessage(messages.control)}>
          <SvgSymbol viewBox='0 0 20 20' sym="keyboard-icon" />
        </span>
        {!this.props.isMinimized &&
          <FormattedMessage {...messages.keyboardShortcuts} />
        }
      </button>
    )

    return (
      <div className={classNames('active-task-details__keyboard-reference',
                                 this.props.className,
                                 {'is-minimized': this.props.isMinimized})}>
        {this.props.user &&
          <div className="columns is-centered">
            <div className="column is-narrow">
              <Popout direction={this.props.isMinimized ? 'right' : 'down'}
                      className={classNames({
                        'is-minimized': this.props.isMinimized,
                        'is-center': !this.props.isMinimized
                      })}
                      control={popoutButton}
                      {..._omit(this.props, 'className')}>
                <h3><FormattedMessage {...messages.keyboardShortcuts} /></h3>

                <dl className="keyboard-shortcuts">{shortcuts}</dl>
                <div className="is-clearfix" />
              </Popout>
            </div>
          </div>
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
