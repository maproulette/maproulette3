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

  render() {
    if (this.props.loadingOSMData || this.props.loadingChangeset) {
      return (
        <div className="mr-bg-blue-dark mr-p-4 mr-rounded-sm mr-flex mr-justify-center mr-items-center">
          <BusySpinner />
        </div>
      )
    }

    const tagChanges = this.props.onlyChanges ?
                       justChanges(_values(this.props.tagDiff)) :
                       _values(this.props.tagDiff)

    if (this.props.hasTagChanges === false || tagChanges.length === 0) {
      return (
        <div className="mr-bg-blue-dark mr-p-4 mr-rounded-sm mr-flex mr-items-center">
          <FormattedMessage {...messages.noChanges} />
        </div>
      )
    }

    const toolbar = (
      <div className="mr-flex mr-mb-1 mr-px-4">
        <div className="mr-text-base mr-text-yellow mr-mr-4">
          <FormattedMessage {...messages.header} />
        </div>

        <div className="mr-flex mr-justify-end">
          {!this.props.compact &&
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

    if (this.state.showChangeset && this.props.xmlChangeset) {
      return (
        <div className="mr-bg-blue-dark mr-py-4 mr-rounded-sm">
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
        className='mr-my-1 mr-flex mr-h-6 mr-items-center'
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
        className={classNames('mr-rounded-sm mr-my-1 mr-h-6 mr-flex mr-items-center', {
          'mr-bg-teal': change.status === 'changed', 
          'mr-bg-red': change.status === 'removed',
        })}
        key={`${change.name}_value`}
      >
        <div
          className="mr-px-2 mr-overflow-x-hidden mr-truncate"
          title={change.value}
        >
          {change.value}
        </div>
      </li>
    )))
    tagValues.unshift(
      <li key='value_header' className='mr-font-bold mr-pb-1 mr-pl-2 mr-h-6'>
        <FormattedMessage {...messages.currentLabel} />
      </li>
    )

    const newValues = (tagChanges.map(change => (
      <li
        className={classNames('mr-rounded-sm mr-my-1 mr-h-6 mr-flex mr-items-center', {
          'mr-bg-teal': change.status === 'changed', 
          'mr-bg-green-light': change.status === 'added',
        })}
        key={`${change.name}_newvalue`}
      >
        <div
          className="mr-px-2 mr-overflow-x-hidden mr-truncate"
          title={change.newValue}
        >
          {change.newValue}
        </div>
      </li>
    )))
    newValues.unshift(
      <li key='newvalue_header' className='mr-font-bold mr-pb-1 mr-pl-2 mr-flex mr-h-6'>
        <FormattedMessage {...messages.proposedLabel} />
      </li>
    )

    return (
      <div className="mr-bg-blue-dark mr-py-4 mr-rounded-sm">
        {toolbar}
        <div className="mr-flex mr-justify-between">
          <ul className="mr-w-1/3 mr-px-4 mr-border-r-2 mr-border-white-10">{tagNames}</ul>
          <ul className="mr-w-1/3 mr-px-4 mr-border-r-2 mr-border-white-10">{tagValues}</ul>
          <ul className="mr-w-1/3 mr-px-4">{newValues}</ul>
        </div>
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
      changeSymbol = <div className="mr-min-w-4 mr-flex-shrink-0 mr-text-teal mr-font-bold">&Delta;</div>
      break
    case 'removed':
      changeSymbol = <div className="mr-min-w-4 mr-flex-shrink-0 mr-text-red mr-font-bold">&mdash;</div>
      break
    case 'added':
      changeSymbol = <div className="mr-min-w-4 mr-flex-shrink-0 mr-text-green-light mr-text-lg mr-leading-none">+</div>
      break
    default:
      changeSymbol = <div className="mr-min-w-4 mr-flex-shrink-0">&nbsp;</div>
      break
  }

  return changeSymbol
}

TagDiffVisualization.propTypes = {
  tagDiff: PropTypes.object,
}

export default injectIntl(TagDiffVisualization)
