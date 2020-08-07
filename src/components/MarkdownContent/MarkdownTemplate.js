import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
import _keys from 'lodash/keys'
import _map from 'lodash/map'
import _split from 'lodash/split'
import _isEqual from 'lodash/isEqual'
import _uniqueId from 'lodash/uniqueId'
import _cloneDeep from 'lodash/cloneDeep'
import classNames from 'classnames'
import MarkdownContent from './MarkdownContent'
import Handlebars from 'handlebars'
import { renderToStaticMarkup } from 'react-dom/server'

/**
 * MarkdownTemplate will handle converting markdown content to html.
 * It was also handle basic mustache tag replacement (eg. {{propName}}).
 * It also handles template tags which are removed from the text and
 * converted into input fields that are outputed in a list following the
 * normal textual content.
 *
 * Current supported template tags are as follows:
 * {{checkbox "Label for checkbox" name="propertyName"}}
 * {{select "Label for select" name="propertyName" values="value1,value2,etc."}}
 *
 * @author [Kelli Rotstan](https://github.com/lrotstan)
 */
export default class MarkdownTemplate extends Component {
  state = {
    questions: {}
  }

  constructor() {
    super()
    Handlebars.registerHelper('checkbox', this.checkboxHandler)
    Handlebars.registerHelper('select', this.selectHandler)
  }

  /**
   * Converts {{{checkbox "some text" name="myPropName"}}} to
   * a checkbox input field which can be rendered in form later.
   **/
  checkboxHandler = (text, options) => {
    const propertyName = options.hash.name
    const body = this.compileTemplate(text, this.props.properties)

    const questions = this.state.questions
    if (!questions[propertyName]) {
      questions[propertyName] = {type: 'checkbox', options, body}
      this.setState({questions})
      if (this.props.setNeedsResponses) {
        this.props.setNeedsResponses(true)
      }
    }

    return ""
  }

  /**
   * Converts {{{select "some text" name="myPropName" values="1,2,3"}}} to
   * a select input field which can be rendered in form later.
   **/
  selectHandler = (text, options) => {
    const propertyName = options.hash.name || `select`
    const body = this.compileTemplate(text, this.props.properties)

    const questions = this.state.questions
    if (!questions[propertyName]) {
      questions[propertyName] = {type: 'select', options, body}
      this.setState({questions})
      if (this.props.setNeedsResponses) {
        this.props.setNeedsResponses(true)
      }
    }

    return ""
  }

  compileTemplate = (content, properties) => {
    const template = Handlebars.compile(content)
    try {
      return template(properties)
    } catch(e) {
      // If there is an error just return content as is. The user
      // could be still typing.
      return content
    }
  }

  toggleResponse = (propertyName) => {
    const responses = this.props.completionResponses
    responses[propertyName] = !responses[propertyName]
    this.props.setCompletionResponse(propertyName, responses[propertyName])
  }

  selectResponse = (propertyName, value) => {
    this.props.setCompletionResponse(propertyName, value)
  }

  markdownContent = (content) => {
    let htmlContent = renderToStaticMarkup(
      <MarkdownContent markdown={content} lightMode={this.props.lightMode} />
    ).replace(/&quot;/g, '"')

    this.setState({content: this.applyTemplating(htmlContent)})
  }

  substitutePropertyTags = (text, properties) => {
    // Handlebars does not handle @ properties (eg. @id). So we will do a
    // simple substitution first.
    let substituted = _cloneDeep(text)
    _keys(properties).forEach(key => {
      let safe = properties[key]
      if (safe) {
        safe = safe.toString().replace(/</g, '&lt;')
        safe = safe.toString().replace(/>/g, '&gt;')
      }

      substituted = substituted.replace(RegExp(`{{\\s*${key}\\s*}}`, "g"), safe)

      // If mustache tags appear in a markdown link, the markdown parser will
      // url-encode them, so do an additional substitution on an url-encoded
      // representation (and url-encode the substituted property value since
      // it's presumably being used in a URL)
      substituted = substituted.replace(
        RegExp(`${encodeURI('{{')}\\s*${encodeURI(key)}\\s*${encodeURI('}}')}`, "g"),
        encodeURI(safe)
      )
    })
    return substituted
  }

  applyTemplating = (content) => {
    const substituted = this.substitutePropertyTags(content, this.props.properties)
    return this.compileTemplate(substituted, this.props.properties)
  }

  componentDidMount() {
    this.markdownContent(this.props.content)
  }

  componentDidUpdate(prevProps) {
    if (this.props.content !== prevProps.content) {
      this.markdownContent(this.props.content)
    }

    else if (!_isEqual(this.props.completionResponses, prevProps.completionResponses)) {
      this.markdownContent(this.props.content)
    }

    else if (!_isEqual(this.props.properties, prevProps.properties)) {
      this.markdownContent(this.props.content)
    }
  }

  renderSelect(propertyName, options, body, props) {
    // Quotes get turned into html entities by markdown compiler
    const quoted_entities = {
      '&#039;': "'",
      '&#x27;': "'",
      '&quot;': '"'
    };

    return (
      <li key={_uniqueId(propertyName)} className="mr-pb-1">
        <select onChange={(e) => this.selectResponse(propertyName, e.target.value)}
                className="select mr-text-black mr-text-xs"
                defaultValue={props.completionResponses[propertyName]}
                disabled={props.disableTemplate}>
          <option key="0" value=""></option>
          {
            _map(_split(options.hash.values, ','), (value, index) =>
              <option key={index} value={value}>
                {value.replace(/&#?\w+;/, match => quoted_entities[match])}
              </option>)
          }
        </select>
        <label className="mr-pl-2" dangerouslySetInnerHTML={{__html:body}} />
      </li>
    )
  }

  renderCheckbox(propertyName, options, body, props) {
    return (
      <li key={_uniqueId(propertyName)} className="mr-pb-1">
        <input type="checkbox" className="checkbox"
               defaultChecked={props.completionResponses[propertyName]}
               disabled={props.disableTemplate}
               onChange={() => this.toggleResponse(propertyName)}/>
        <label className="mr-pl-2" dangerouslySetInnerHTML={{__html:body}} />
      </li>
    )
  }

  render() {
    if (_isEmpty(this.state.content)) {
      return null
    }

    return (
      <div>
        {this.props.header}
        <div className={classNames("mr-mb-4",
                                   {"mr-overflow-scroll mr-h-40 mr-pb-2": this.props.inModal})}
          dangerouslySetInnerHTML={{__html: this.state.content}}
        />
        {!_isEmpty(this.state.questions) &&
          <ul className={classNames("mr-p-3",
                                    {"mr-bg-black-5": !this.props.inModal,
                                     "mr-mt-2 mr-bg-black-50 mr-h-32 mr-overflow-scroll": !!this.props.inModal})}>
            {_map(this.state.questions, (value, key) =>
                value.type === "select" ?
                  this.renderSelect(key, value.options, value.body, this.props) :
                  this.renderCheckbox(key, value.options, value.body, this.props)
              )
            }
          </ul>
        }
      </div>
    )
  }
}

MarkdownTemplate.propTypes = {
  content: PropTypes.string.isRequired,
  completionResponses: PropTypes.object.isRequired,
  setCompletionResponse: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
  disableTemplate: PropTypes.bool
}
