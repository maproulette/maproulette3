import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl, FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import xmlLang from 'react-syntax-highlighter/dist/languages/hljs/xml'
import highlightColors from 'react-syntax-highlighter/dist/styles/hljs/agate'
import vkbeautify from 'vkbeautify'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import _cloneDeep from 'lodash/cloneDeep'
import _isEmpty from 'lodash/isEmpty'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

SyntaxHighlighter.registerLanguage('xml', xmlLang)

/**
 * TagDiffVisualization renders a tag differences either as an OSM changeset
 * (XML) or as a list with each tag represented with a symbol denoting a tag
 * change, add, or removal (if any); the tag name; the current value; and the
 * proposed value
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class TagDiffVisualization extends Component {
  state = {
    showChangeset: false,  // XML-changeset view instead of tag-list view
    editing: false,        // edit mode (table/list view only)
    tagEdits: null,        // user-made edits to tags
    addingTag: false,      // user is adding a new tag
    newTagName: null,      // name of new tag being added
    newTagValid: false,    // whether new tag name can be added
  }

  /**
   * Switch to changeset/XML view of tag changes
   */
  switchToChangeset() {
    if (!this.props.xmlChangeset && !this.props.loadingChangeset && this.props.loadXMLChangeset) {
      this.props.loadXMLChangeset()
    }
    this.setState({showChangeset: true})
  }

  /**
   * Switch to table/list view of tag changes
   */
  switchToTable() {
    this.setState({showChangeset: false})
  }

  /**
   * Switch to edit mode (table/list view only)
   */
  beginEditing() {
    this.setState({
      showChangeset: false,
      editing: true,
      tagEdits: _cloneDeep(this.props.tagDiff) || {}
    })
  }

  updateTagValue(tagName, updatedValue) {
    const tagEdits = this.state.tagEdits
    tagEdits[tagName].newValue = updatedValue

    // type-agnostic comparison
    // eslint-disable-next-line
    if (updatedValue == tagEdits[tagName].value) {
      tagEdits[tagName].status = 'unchanged'
    }
    else if (tagEdits[tagName].status === 'unchanged') {
      tagEdits[tagName].status = 'changed'
    }

    this.setState({tagEdits})
  }

  keepTag(tagName) {
    const tagEdits = this.state.tagEdits

    if (tagEdits[tagName].status === 'removed') {
      tagEdits[tagName].newValue = tagEdits[tagName].value
      tagEdits[tagName].status = 'unchanged'
    }

    this.setState({tagEdits})
  }

  deleteTag(tagName) {
    const tagEdits = this.state.tagEdits

    if (tagEdits[tagName].status === 'added') {
      delete tagEdits[tagName]
    }
    else {
      tagEdits[tagName].status = 'removed'
    }

    this.setState({tagEdits})
  }

  beginAddingTag() {
    this.setState({addingTag: true, newTagName: '', newTagValid: false})
  }

  setNewTagName(name) {
    const isValid = !_isEmpty(name) && !this.state.tagEdits[name]
    this.setState({newTagName: name, newTagValid: isValid})
  }

  addNewTag() {
    if (!this.state.newTagValid) {
      return
    }

    const tagEdits = this.state.tagEdits
    tagEdits[this.state.newTagName] = {
      name: this.state.newTagName,
      value: null,
      newValue: '',
      status: 'added',
    }

    this.setState({tagEdits, addingTag: false, newTagName: null, newTagValid: false})
  }

  cancelNewTag() {
    this.setState({addingTag: false, newTagName: null, newTagValid: false})
  }

  saveEdits() {
    this.props.setTagEdits(this.state.tagEdits)
    this.setState({showChangeset: false, editing: false, tagEdits: null})
  }

  cancelEdits() {
    this.setState({showChangeset: false, editing: false, tagEdits: null})
  }

  restoreOriginalFix() {
    this.props.revertTagEdits()
    this.setState({showChangeset: false, editing: false, tagEdits: null})
  }

  render() {
    if (this.props.loadingOSMData || this.props.loadingChangeset) {
      return (
        <div className="mr-bg-blue-dark mr-p-4 mr-rounded-sm mr-flex mr-justify-center mr-items-center">
          <BusySpinner />
        </div>
      )
    }

    let tagChanges = _values(this.state.editing ? this.state.tagEdits : this.props.tagDiff)
    if (this.props.onlyChanges && !this.state.editing) {
      tagChanges = justChanges(tagChanges)
    }

    const toolbar = this.props.suppressToolbar ? null : (
      <div className="mr-flex mr-mb-1 mr-px-4">
        <div className="mr-text-base mr-text-yellow mr-mr-4">
          {this.props.onlyChanges ?
           <FormattedMessage {...messages.justChangesHeader} /> :
           <FormattedMessage {...messages.allTagsHeader} />
          }
        </div>

        <div className="mr-flex mr-justify-end">
          {this.state.editing &&
           <button
             className="mr-button mr-button--xsmall mr-button--danger"
             onClick={() => this.restoreOriginalFix()}
             title={this.props.intl.formatMessage(messages.restoreFixTooltip)}
           >
             <FormattedMessage {...messages.restoreFixLabel} />
           </button>
          }
          {!this.props.compact && !this.state.editing &&
           <React.Fragment>
             <button
               className={classNames(
                 "mr-mr-4",
                 this.state.showChangeset ? "mr-text-green-light" : "mr-text-green-lighter"
               )}
               onClick={() => this.switchToTable()}
               title={this.props.intl.formatMessage(messages.tagListTooltip)}
             >
               <SvgSymbol
                 sym="list-icon"
                 viewBox="0 0 20 20"
                 className="mr-transition mr-fill-current mr-w-4 mr-h-4"
               />
             </button>
             <button
               className={classNames(
                 "mr-mr-4",
                 this.state.showChangeset ? "mr-text-green-lighter" : "mr-text-green-light"
               )}
               onClick={() => this.switchToChangeset()}
               title={this.props.intl.formatMessage(messages.changesetTooltip)}
             >
               <span className="mr-transition">&lt;/&gt;</span>
             </button>
             <button
               className="mr-mr-4 mr-text-green-light"
               onClick={() => this.beginEditing()}
               title={this.props.intl.formatMessage(messages.editTagsTooltip)}
             >
               <SvgSymbol
                 sym="edit-icon"
                 viewBox="0 0 20 20"
                 className="mr-transition mr-fill-current mr-w-4 mr-h-4"
               />
             </button>
           </React.Fragment>
          }
          {this.props.compact &&
           <button className="mr-text-green-light" onClick={this.props.showDiffModal}>
             <SvgSymbol
               sym="expand-icon"
               viewBox="0 0 32 32"
               className="mr-transition mr-fill-current mr-w-4 mr-h-4"
             />
           </button>
          }
        </div>
      </div>
    )

    if (this.props.onlyChanges &&
        (this.props.hasTagChanges === false || tagChanges.length === 0)) {
      return (
        <div className="mr-bg-blue-dark mr-p-4 mr-rounded-sm mr-flex-columns">
          {toolbar}
          <div className="mr-px-4 mr-mt-4">
            <FormattedMessage {...messages.noChanges} />
          </div>
        </div>
      )
    }

    if (this.state.showChangeset && this.props.xmlChangeset) {
      if (this.props.hasTagChanges === false || tagChanges.length === 0) {
        return (
          <div className="mr-bg-blue-dark mr-p-4 mr-rounded-sm mr-flex-columns">
            {toolbar}
            <div className="mr-px-4 mr-mt-4">
              <FormattedMessage {...messages.noChangeset} />
            </div>
          </div>
        )
      }

      return (
        <div className="mr-bg-blue-dark mr-py-2 mr-rounded-sm">
          {toolbar}
          <div className="mr-px-4">
            <SyntaxHighlighter
              language="xml"
              style={highlightColors}
              customStyle={{background: 'transparent'}}
            >
              {vkbeautify.xml(this.props.xmlChangeset)}
            </SyntaxHighlighter>
          </div>
        </div>
      )
    }
        
    const tagNames = tagChanges.map(change => (
      <li
        className='mr-border-2 mr-border-transparent mr-my-2 mr-py-3 mr-flex mr-h-6 mr-items-center'
        key={`${change.name}_name`} 
      >
        {changeSymbol(change)} <div
          className="mr-flex-shrink-1 mr-overflow-x-hidden mr-truncate"
          title={change.name}
        >
          {change.name}
        </div>
      </li>
    ))
    tagNames.unshift(
      <li key='name_header' className='mr-font-bold mr-pb-1 mr-h-6'>&nbsp;</li>
    )

    const tagValues = (tagChanges.map(change => (
      <li
        className={classNames('mr-border-2 mr-rounded-sm mr-my-2 mr-py-3 mr-h-6 mr-flex mr-items-center', {
          'mr-border-orange mr-bg-black-15': change.status === 'changed',
          'mr-border-lavender-rose mr-bg-black-15': change.status === 'removed',
          'mr-border-transparent': (change.status !== 'changed' && change.status !== 'removed'),
        })}
        key={`${change.name}_value`}
      >
        <div
          className="mr-px-2 mr-overflow-x-hidden mr-truncate mr-text-base"
          title={change.value}
        >
          {change.value}
        </div>
      </li>
    )))
    tagValues.unshift(
      <li key='value_header' className='mr-text-base mr-font-bold mr-pb-1 mr-pl-2 mr-h-6'>
        <FormattedMessage {...messages.currentLabel} />
      </li>
    )

    const newValues = (tagChanges.map(change => (
      <li
        className={classNames(
          'mr-border-2 mr-rounded-sm mr-my-2 mr-py-3 mr-h-6 mr-flex mr-items-center',
          this.state.editing ? 'mr-border-transparent' : {
            'mr-border-picton-blue mr-bg-black-15': change.status === 'added',
            'mr-border-orange mr-bg-black-15': change.status === 'changed',
            'mr-border-transparent': (change.status !== 'added' && change.status !== 'changed'),
          }
        )}
        key={`${change.name}_newvalue`}
      >
        {this.state.editing &&
         <React.Fragment>
           {change.status === 'removed' ?
            <button
              className="mr-button mr-button--xsmall"
              onClick={() => this.keepTag(change.name)}
            >
              <FormattedMessage {...messages.keepTagLabel} />
            </button> :
            <React.Fragment>
              <input
                type="text"
                value={change.newValue}
                onChange={e => this.updateTagValue(change.name, e.target.value)}
              />
              <button
                className="mr-ml-2 mr-text-red"
                onClick={() => this.deleteTag(change.name)}
                title={this.props.intl.formatMessage(messages.deleteTagTooltip)}
              >
                <SvgSymbol
                  sym="trash-icon"
                  viewBox="0 0 20 20"
                  className="mr-transition mr-fill-current mr-w-4 mr-h-4"
                />
              </button>
           </React.Fragment>
           }
         </React.Fragment>
        }
        {!this.state.editing &&
         <div
           className="mr-px-2 mr-overflow-x-hidden mr-truncate mr-text-base"
           title={change.newValue}
         >
           {change.newValue}
         </div>
        }
      </li>
    )))
    newValues.unshift(
      <li key='newvalue_header' className='mr-text-base mr-font-bold mr-pb-1 mr-pl-2 mr-flex mr-h-6'>
        <FormattedMessage {...messages.proposedLabel} />
      </li>
    )

    return (
      <div>
        {toolbar}
        <div className="mr-flex mr-justify-between">
          <ul className="mr-w-1/3 mr-px-4 mr-border-r-2 mr-border-white-10">
            {tagNames}
            {this.state.editing &&
             <AddTagControl
               addingTag={this.state.addingTag}
               beginAddingTag={() => this.beginAddingTag()}
               newTagName={this.state.newTagName}
               newTagValid={this.state.newTagValid}
               setNewTagName={name => this.setNewTagName(name)}
               addNewTag={() => this.addNewTag()}
               cancelNewTag={() => this.cancelNewTag()}
               intl={this.props.intl}
             />
            }
          </ul>
          <ul className="mr-w-1/3 mr-px-4 mr-border-r-2 mr-border-white-10">{tagValues}</ul>
          <ul className="mr-w-1/3 mr-px-4">{newValues}</ul>
        </div>
        {this.state.editing &&
         <div className="mr-flex mr-justify-end">
           <button className="mr-button mr-mr-4" onClick={() => this.saveEdits()}>
             <FormattedMessage {...messages.saveLabel} />
           </button>

           <button
             className="mr-button mr-button--white"
             onClick={() => this.cancelEdits()}
           >
             <FormattedMessage {...messages.cancelLabel} />
           </button>
         </div>
        }
      </div>
    )
  }
}

/**
 * Filters out unchanged tags from the given diff values
 */
export const justChanges = tagDiffValues => {
  return _filter(tagDiffValues, tag => tag.status !== 'unchanged')
}

/**
 * Renders an icon/symbol that represents the given tag change
 */
export const changeSymbol = change => {
  let changeSymbol = null
  switch(change.status) {
    case 'changed':
      changeSymbol = <div className="mr-min-w-5 mr-mr-1 mr-flex-shrink-0 mr-text-orange mr-text-lg mr-font-bold">&Delta;</div>
      break
    case 'removed':
      changeSymbol = <div className="mr-min-w-5 mr-mr-1 mr-flex-shrink-0 mr-text-lavender-rose mr-text-lg mr-font-bold">&mdash;</div>
      break
    case 'added':
      changeSymbol = <div className="mr-min-w-5 mr-mr-1 mr-flex-shrink-0 mr-text-picton-blue mr-text-3xl mr-leading-none">+</div>
      break
    default:
      changeSymbol = <div className="mr-min-w-5 mr-mr-1 mr-flex-shrink-0">&nbsp;</div>
      break
  }

  return changeSymbol
}

export const AddTagControl = props => {
  if (!props.addingTag) {
    return (
      <button
        className="mr-button mr-button--xsmall"
        onClick={props.beginAddingTag}
      >
        <FormattedMessage {...messages.addTagLabel} />
      </button>
    )
  }

  return (
    <div className="mr-flex">
      <input
        type="text"
        className="mr-mr-2"
        value={props.newTagName}
        onChange={e => props.setNewTagName(e.target.value)}
        placeholder={props.intl.formatMessage(messages.tagNamePlaceholder)}
        onKeyDown={e => { // Support Enter and ESC keys
          if (e.key === "Escape") {
            props.cancelNewTag()
          }
          else if (props.newTagValid && e.key === "Enter") {
            props.addNewTag()
          }
        }}
      />
      {props.newTagValid &&
       <button
         className="mr-mr-2 mr-text-green-light"
         onClick={props.addNewTag}
         title={props.intl.formatMessage(messages.addTagLabel)}
       >
         <SvgSymbol
           sym="check-circled-icon"
           viewBox="0 0 20 20"
           className="mr-transition mr-fill-current mr-w-4 mr-h-4"
         />
       </button>
      }
      <button
        className="mr-text-green-light"
        onClick={props.cancelNewTag}
        title={props.intl.formatMessage(messages.cancelLabel)}
      >
        <SvgSymbol
          sym="cross-icon"
          viewBox="0 0 20 20"
          className="mr-transition mr-fill-current mr-w-4 mr-h-4"
        />
      </button>
    </div>
  )
}

TagDiffVisualization.propTypes = {
  tagDiff: PropTypes.object,
}

export default injectIntl(TagDiffVisualization)
