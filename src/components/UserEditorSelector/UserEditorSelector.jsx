import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
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
    const configuredEditor = this.props.user?.settings?.defaultEditor ?? (Editor.none)
    let current = configuredEditor === Editor.none ? DEFAULT_EDITOR : configuredEditor

    if (this.props.allowedEditors && this.props.allowedEditors.indexOf(current) === -1) {
      current = this.props.allowedEditors[0]
    }

    return current
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
        <div className="mr-flex">
          <Button
            className="mr-button--green-fill mr-px-2 mr-cursor-pointer mr-text-sm"
            onClick={() => this.props.pickEditor({value: this.currentEditor()})}
            style={{minWidth: '11.5rem'}}
          >
            {this.state.isSaving ? <BusySpinner /> : (
              localizedEditorLabels[keysByEditor[this.currentEditor()]] || 
              <FormattedMessage {...messages.editLabel} />
            )}
          </Button>
          <Dropdown
           className="mr-dropdown mr-dropdown--fixed mr-left-0"
           dropdownButton={dropdown =>
            <button
              className="mr-button--green-fill mr-cursor-pointer mr-p-2"
              onClick={dropdown.toggleDropdownVisible}
            >
              <SvgSymbol
                sym="icon-cheveron-down"
                viewBox="0 0 20 20"
                className="mr-fill-white mr-w-4 mr-h-4"
              />
            </button>
           }
           dropdownContent={dropdown =>
              <ListEditorItems
                allowedEditors={this.props.allowedEditors}
                editorLabels={localizedEditorLabels}
                activeEditor={this.currentEditor()}
                chooseEditor={this.chooseEditor}
                closeDropdown={dropdown.closeDropdown}
                pickEditor={this.props.pickEditor}
              />
           }
         />
        </div>
      </div>
    )
  }
}

const ListEditorItems = ({
  editorLabels,
  allowedEditors,
  activeEditor,
  chooseEditor,
  closeDropdown,
  pickEditor
}) => {
  const renderEditorItems = (isAllowed) =>
    _compact(
      _map(editorLabels, (label, key) => {
        const editor = Editor[key]
        if (editor === Editor.none) return null

        const isEditorAllowed = !allowedEditors || allowedEditors.includes(editor)
        if (isEditorAllowed !== isAllowed) return null

        return (
          <li key={editor} className={classNames({ "active": editor === activeEditor})}>
            <a onClick={() => isEditorAllowed ? chooseEditor(editor, closeDropdown) : pickEditor({value: editor})}>
              <div className="mr-flex mr-items-center">
                {!isEditorAllowed ? (
                  <SvgSymbol
                    sym='link-icon'
                    viewBox='0 0 20 20'
                    className="mr-h-3 mr-w-3 mr-fill-current mr-mr-2"
                  /> 
                ) : null}
                {label}
              </div>
            </a>
          </li>
        )
      })
    )

  const editorItems = renderEditorItems(true)
  const unsupportedEditorItems = renderEditorItems(false)

  return (
    <ol className="mr-list-dropdown">
      <div className="mr-mb-2">
        <div className="mr-mb-2"> <FormattedMessage {...messages.defaultEditor} /></div>
        {editorItems}
      </div>
      {unsupportedEditorItems.length > 0 && (
        <div className="mr-text-sm">
          <div className="mr-mb-2"> <FormattedMessage {...messages.unsupportedEditor} /></div>
          {unsupportedEditorItems}
        </div>
      )}
    </ol>
  )
}
