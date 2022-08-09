import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _get from 'lodash/get'
import { DEFAULT_EDITOR, Editor, keysByEditor, editorLabels }
       from '../../services/Editor/Editor'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

export default class UserEditorSelector extends Component {
  state = {
    isSaving: false,
  }

  currentEditor = () => {
    const configuredEditor =
      _get(this.props, 'user.settings.defaultEditor', Editor.none)
    let current = configuredEditor === Editor.none ? DEFAULT_EDITOR : configuredEditor

    // If the current editor isn't allowed, just go with the first allowed editor
    if (this.props.allowedEditors && this.props.allowedEditors.indexOf(current) === -1) {
      current = this.props.allowedEditors[0]
    }

    return current
  }

  chooseEditor = (editor, closeDropdown) => {
    const updatedSettings =
      Object.assign({}, this.props.user.settings, {defaultEditor: editor})

    this.setState({isSaving: true})
    this.props.updateUserSettings(this.props.user.id, updatedSettings).then(() =>
      this.setState({isSaving: false})
    )
    closeDropdown()
  }

  render() {
    const localizedEditorLabels = editorLabels(this.props.intl)

    return (
      <div className="mr-text-xs mr-text-white mr-flex mr-pt-2 mr-whitespace-no-wrap">
        <span className="mr-mr-1">
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
      </div>
    )
  }
}

const EditorButton = function(props) {
  return (
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
}

const ListEditorItems = function(props) {
  const editorItems = _compact(_map(props.editorLabels, (label, key) => {
    const editor = Editor[key]
    // Don't offer 'none' option
    if (editor === Editor.none) {
      return null
    }

    // Honor any restrictions on allowed editors
    if (props.allowedEditors && props.allowedEditors.indexOf(editor) === -1) {
      return null
    }

    return (
      <li
        key={editor}
        className={classNames({"active": editor === props.activeEditor})}
      >
        <a onClick={() => props.chooseEditor(editor, props.closeDropdown)}>
          {label}
        </a>
      </li>
    )
  }))

  return (
    <ol className="mr-list-dropdown">
      {editorItems}
    </ol>
  )
}
