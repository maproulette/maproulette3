import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import { DEFAULT_EDITOR, Editor }
       from '../../../../../services/Editor/Editor'
import Button from '../../../../Button/Button'
import messages from './Messages'

/**
 * TaskEditControl renders a control for initiating the editing process for a
 * task. If the user has a default editor set, it will automatically be opened
 * when the control is clicked; otherwise the user will be shown a dropdown
 * with a choice of editors.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class TaskEditControl extends Component {
  /** Process keyboard shortcuts for the edit controls */
  handleKeyboardShortcuts = (event) => {
    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    // Ignore if modifier keys were pressed
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return
    }

    const editShortcuts = this.props.keyboardShortcutGroups.openEditor

    switch(event.key) {
      case editShortcuts.editId.key:
        this.props.pickEditor({value: Editor.id})
        break
      case editShortcuts.editJosm.key:
        this.props.pickEditor({value: Editor.josm})
        break
      case editShortcuts.editJosmLayer.key:
        this.props.pickEditor({value: Editor.josmLayer})
        break
      case editShortcuts.editJosmFeatures.key:
        this.props.pickEditor({value: Editor.josmFeatures})
        break
      case editShortcuts.editLevel0.key:
        this.props.pickEditor({value: Editor.level0})
        break
      case editShortcuts.editRapid.key:
        this.props.pickEditor({value: Editor.rapid})
        break
      default:
    }
  }

  currentEditor = () => {
    const configuredEditor =
      _get(this.props, 'user.settings.defaultEditor', Editor.none)
    return configuredEditor === Editor.none ? DEFAULT_EDITOR : configuredEditor
  }

  componentDidMount() {
    this.props.activateKeyboardShortcutGroup(
      _pick(this.props.keyboardShortcutGroups, 'openEditor'),
      this.handleKeyboardShortcuts)
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcutGroup('openEditor',
                                               this.handleKeyboardShortcuts)
  }

  render() {
    return (
      <Button
        className="mr-button--blue-fill"
        title={this.props.intl.formatMessage(messages.editTooltip)}
        onClick={() => this.props.pickEditor({value: this.currentEditor()})}
      >
        <FormattedMessage {...messages.editLabel} />
      </Button>
    )
  }
}

TaskEditControl.propTypes = {
  /** The current user */
  user: PropTypes.object,
  /** Set to true to render in a minimized form */
  isMinimized: PropTypes.bool,
  /** Invoked when the user indicates an editor should be opened */
  pickEditor: PropTypes.func.isRequired,
  /** Available keyboard shortcuts */
  keyboardShortcutGroups: PropTypes.object.isRequired,
  /** Invoked when keyboard shortcuts are to be active */
  activateKeyboardShortcutGroup: PropTypes.func.isRequired,
  /** Invoked when keyboard shortcuts should no longer be active  */
  deactivateKeyboardShortcutGroup: PropTypes.func.isRequired,
}
