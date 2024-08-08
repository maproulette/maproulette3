import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _pick from 'lodash/pick'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import { DEFAULT_EDITOR, Editor, keysByEditor, editorLabels } from '../../services/Editor/Editor'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'
import Button from '../Button/Button'

const shortcutGroup = 'openEditor'

export default class UserEditorSelector extends Component {
  state = {
    isSaving: false,
  }

  /** Process keyboard shortcuts for the edit controls */
  handleKeyboardShortcuts = (event) => {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.props.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    if (this.props.textInputActive(event)) { // ignore typing in inputs
      return
    }

    // Ignore if modifier keys were pressed
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return
    }

    const editShortcuts = this.props.keyboardShortcutGroups[shortcutGroup]

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
    const configuredEditor = _get(this.props, 'user.settings.defaultEditor', Editor.none)
    return configuredEditor === Editor.none ? DEFAULT_EDITOR : configuredEditor
  }

  componentDidMount() {
    this.props.activateKeyboardShortcutGroup(
      _pick(this.props.keyboardShortcutGroups, shortcutGroup),
      this.handleKeyboardShortcuts
    )
  }

  componentWillUnmount() {
    this.props.deactivateKeyboardShortcutGroup(shortcutGroup, this.handleKeyboardShortcuts)
  }

  chooseEditor = (editor, closeDropdown) => {
    const updatedSettings = Object.assign({}, this.props.user.settings, {defaultEditor: editor})

    this.setState({isSaving: true})
    this.props.updateUserSettings(this.props.user.id, updatedSettings).then(() =>
      this.setState({isSaving: false})
    )
    closeDropdown()
  }

  render() {
    const localizedEditorLabels = editorLabels(this.props.intl)

    return (
      <div className="mr-text-xs mr-text-white mr-flex mr-whitespace-nowrap mr-items-center">
        <span className="mr-mr-1 mr-text-sm">
          <FormattedMessage {...messages.currentlyUsing} />
        </span>
        {this.state.isSaving ? <BusySpinner /> :
         <Dropdown
           className="mr-dropdown mr-dropdown--fixed"
           dropdownButton={dropdown =>
             <EditorButton
               editorLabels={localizedEditorLabels}
               userEditor={this.currentEditor()}
               toggleDropdownVisible={dropdown.toggleDropdownVisible}
             />
           }
           dropdownContent={dropdown =>
              <ListEditorItems
                allowedEditors={this.props.allowedEditors}
                editorLabels={localizedEditorLabels}
                activEditor={this.currentEditor()}
                chooseEditor={this.chooseEditor}
                closeDropdown={dropdown.closeDropdown}
              />
           }
         />
        }
        <div className={"mr-flex"}>
          <Button
            className="mr-button--green-fill mr-ml-2 mr-px-8 mr-cursor-pointer mr-text-sm"
            onClick={() => this.props.pickEditor({value: this.currentEditor()})}
          >
            <FormattedMessage {...messages.editLabel} />
          </Button>
        </div>
      </div>
    )
  }
}

const EditorButton = (props) => (
  <button
    className="mr-dropdown__button"
    onClick={props.toggleDropdownVisible}
  >
    <span className="mr-flex">
      <b className="mr-mr-1">{props.editorLabels[keysByEditor[props.userEditor]]}</b>
      <SvgSymbol
        sym="icon-cheveron-down"
        viewBox="0 0 20 20"
        className="mr-fill-green-lighter mr-w-4 mr-h-4"
      />
    </span>
  </button>
)
const ListEditorItems = ({
  editorLabels,
  allowedEditors,
  activeEditor,
  chooseEditor,
  closeDropdown
}) => {
  const renderEditorItems = (isAllowed) =>
    _compact(
      _map(editorLabels, (label, key) => {
        const editor = Editor[key]
        if (editor === Editor.none) return null

        const isEditorAllowed = !allowedEditors || allowedEditors.includes(editor)
        if (isEditorAllowed !== isAllowed) return null

        return (
          <li key={editor} className={classNames({ "active": editor === activeEditor })}>
            <a onClick={() => chooseEditor(editor, closeDropdown)}>
              {label}
            </a>
          </li>
        )
      })
    )

  const editorItems = renderEditorItems(true)
  const notAllowedEditorItems = renderEditorItems(false)

  return (
    <ol className="mr-list-dropdown">
      {notAllowedEditorItems.length > 0 ? (
        <div className="mr-mb-2">
          Recommended Editors:
          {editorItems}
        </div>
      ) : (
        editorItems
      )}
      {notAllowedEditorItems.length > 0 && (
        <div>
          Unrecommended Editors:
          {notAllowedEditorItems}
        </div>
      )}
    </ol>
  )
}
