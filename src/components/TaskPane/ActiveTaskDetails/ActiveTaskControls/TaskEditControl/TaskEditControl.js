import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import { NONE, Editor, keysByEditor, editorLabels }
       from '../../../../../services/Editor/Editor'
import DropdownButton from '../../../../Bulma/DropdownButton'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import WithDeactivateOnOutsideClick
       from '../../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import messages from './Messages'

// Setup child components with needed HOCs.
const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

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
      case editShortcuts.editLevel0.key:
        this.props.pickEditor({value: Editor.level0})
        break
      default:
    }
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
    const editControlClasses = classNames(
      "button edit-control", this.props.className,
      {"large-and-wide full-width": !this.props.isMinimized,
       "icon-only": this.props.isMinimized})

    const editControlContent = [
      <span key="control-icon" className="control-icon">
        <SvgSymbol viewBox='0 0 20 20' sym="edit-icon" />
      </span>,
      <span key="control-label" className="control-label">
        <FormattedMessage {...messages.editLabel} />
      </span>
    ]

    const defaultEditor = _get(this.props, 'user.settings.defaultEditor', Editor.none)
    if (defaultEditor !== Editor.none) {
      // If the user has a favorite editor, open that immediately when they click
      // the edit control.
      return (
        <button className={editControlClasses}
                title={this.props.intl.formatMessage(messages.editTooltip)}
                onClick={() => this.props.pickEditor({value: defaultEditor})}>
          {editControlContent}
        </button>
      )
    }
    else {
      // Show a dropdown of editor choices
      const localizedLabels = editorLabels(this.props.intl)
      const editorDropdownOptions = _map(_keys(_omit(Editor, keysByEditor[NONE])),
        editor => ({ key: Editor[editor], text: localizedLabels[editor], value: Editor[editor] })
      )

      return (
        <DeactivatableDropdownButton
          className={classNames('editor-dropdown',
                                {'full-width': !this.props.isMinimized,
                                 'popout-right': this.props.isMinimized})}
          triggerClassName={classNames({'full-width': !this.props.isMinimized})}
          tooltip={this.props.intl.formatMessage(messages.editTooltip)}
          options={editorDropdownOptions} onSelect={this.props.pickEditor}
        >
          <button className={editControlClasses}>
            {editControlContent}
          </button>
        </DeactivatableDropdownButton>
      )
    }
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
