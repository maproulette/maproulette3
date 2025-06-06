import PropTypes from "prop-types";
import { Component } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import jsonLang from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import highlightColors from "react-syntax-highlighter/dist/esm/styles/hljs/agate";
import BusySpinner from "../BusySpinner/BusySpinner";

SyntaxHighlighter.registerLanguage("json", jsonLang);

highlightColors.hljs.background = "rgba(0, 0, 0, 0.15)";
highlightColors.hljs.margin = "0px";

export default class ViewTask extends Component {
  render() {
    if (!this.props.task?.geometries) {
      return <BusySpinner />;
    }

    return (
      <div className="view-task">
        <SyntaxHighlighter language="json" style={highlightColors}>
          {JSON.stringify(this.props.task.geometries, null, 4)}
        </SyntaxHighlighter>
      </div>
    );
  }
}

ViewTask.propTypes = {
  /** The task to display */
  task: PropTypes.object,
};
