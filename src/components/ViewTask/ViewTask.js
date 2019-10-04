import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import jsonLang from 'react-syntax-highlighter/dist/languages/hljs/json'
import highlightColors from 'react-syntax-highlighter/dist/styles/hljs/github'
import BusySpinner from '../BusySpinner/BusySpinner'
import _get from 'lodash/get'

SyntaxHighlighter.registerLanguage('json', jsonLang);

export default class ViewTask extends Component {
  render() {
    if (!_get(this.props, 'task.geometries')) {
      return <BusySpinner />
    }

    return (
      <div className="view-task">
        <SyntaxHighlighter language="json" style={highlightColors}>
          {JSON.stringify(this.props.task.geometries, null, 4)}
        </SyntaxHighlighter>
      </div>
    )
  }
}

ViewTask.propTypes = {
  /** The task to display */
  task: PropTypes.object,
}
