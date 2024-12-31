import classNames from "classnames";
import _isEmpty from "lodash/isEmpty";
import _join from "lodash/join";
import _map from "lodash/map";
import { Component } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import {
  TaskPropertySearchTypeNumber,
  TaskPropertySearchTypeString,
} from "../../services/Task/TaskProperty/TaskProperty";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import messages from "./Messages";

/**
 * FeatureStyleLegend displays a legend of custom feature styles setup on the
 * current challenge
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class FeatureStyleLegend extends Component {
  compactedComparator = (search) => {
    switch (search.searchType) {
      case TaskPropertySearchTypeString.equals:
        return "=";
      case TaskPropertySearchTypeString.contains:
        return this.props.intl.formatMessage(messages.containsLabel);
      case TaskPropertySearchTypeString.exists:
        return this.props.intl.formatMessage(messages.existsLabel);
      case TaskPropertySearchTypeString.missing:
        return this.props.intl.formatMessage(messages.missingLabel);
      case TaskPropertySearchTypeString.notEqual:
        return "≠";
      case TaskPropertySearchTypeNumber.greaterThan:
        return ">";
      case TaskPropertySearchTypeNumber.lessThan:
        return "<";
      default:
        return search.searchType;
    }
  };

  compactedFilter = (search) => {
    if (!search.operationType) {
      let value = `\`${search.value}\``;
      if (
        search.searchType === TaskPropertySearchTypeString.missing ||
        search.searchType === TaskPropertySearchTypeString.exists
      ) {
        value = "";
      }
      return `\`${search.key}\` ${this.compactedComparator(search)} ${value}`;
    } else {
      return `(${this.compactedFilter(search.left)} ${search.operationType.toUpperCase()} ${this.compactedFilter(search.right)})`;
    }
  };

  compactedStyle = (style) => {
    return {
      styling: _map(style.styles, (style) => `${style.styleName}: ${style.styleValue}`),
      filter: this.compactedFilter(style.propertySearch),
    };
  };

  render() {
    const challenge = this.props.challenge || this.props.task?.parent;
    if (!challenge) {
      return null;
    }

    if (_isEmpty(challenge.taskStyles)) {
      return (
        <div>
          <FormattedMessage {...messages.noStyles} />
        </div>
      );
    }

    const styleDescriptions = _map(challenge.taskStyles, (style, index) => {
      const compacted = this.compactedStyle(style);
      // Trim any outer parenthesees from filter string
      compacted.filter = compacted.filter.replace(/(^\()|(\)$)/g, "");

      const markdownDescription = `### ${_join(compacted.styling, "\n### ")}\n\n${compacted.filter}`;
      return (
        <div
          key={index}
          className={classNames({ "mr-mt-4 mr-pt-4 mr-border-t mr-border-grey-light": index > 0 })}
        >
          <MarkdownContent key={index} markdown={markdownDescription} />
        </div>
      );
    });

    return <div>{styleDescriptions}</div>;
  }
}

export default injectIntl(FeatureStyleLegend);
