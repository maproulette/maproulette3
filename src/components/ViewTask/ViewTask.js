import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import jsonLang from 'react-syntax-highlighter/dist/languages/hljs/json'
import highlightColors from 'react-syntax-highlighter/dist/styles/hljs/github'
import BusySpinner from '../BusySpinner/BusySpinner'

SyntaxHighlighter.registerLanguage('json', jsonLang);

export default class ViewTask extends Component {
  render() {
    if (!this.props.task) {
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
