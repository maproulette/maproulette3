import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _flatten from 'lodash/flatten'
import _values from 'lodash/values'
import WithKeyboardShortcuts
       from '../../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import './KeyboardShortcutList.scss'

/**
 * KeyboardShortcutList renders the given keyboard shortcuts as a definition
 * list
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class KeyboardShortcutList extends Component {
  render() {
    const flattenedShortcuts =
      _flatten(_map(this.props.activeKeyboardShortcuts, group => _values(group)))

    const shortcuts = _map(flattenedShortcuts, (value, operation) =>
      <dl key={`shortcut-${operation}`}>
        <dt key={`term-${operation}`}>
          {value.keyLabel ?
            <FormattedMessage {...value.keyLabel} /> :
            value.key
          }
        </dt>
        <dd key={`def-${operation}`}>
          <FormattedMessage {...value.label} />
        </dd>
      </dl>
    )

    return (
      <div className="keyboard-shortcut-list">
        {shortcuts}
      </div>
    )
  }
}

export default WithKeyboardShortcuts(KeyboardShortcutList)
