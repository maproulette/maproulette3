import React, { Component } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import classNames from 'classnames'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _join from 'lodash/join'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import messages from './Messages'

/**
 * FeatureStyleLegend displays a legend of custom feature styles setup on the
 * current challenge
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class FeatureStyleLegend extends Component {
  compactedComparator = search => {
    switch(search.searchType) {
      case "equals":
        return "="
      case "contains":
        return this.props.intl.formatMessage(messages.containsLabel)
      case "not_equal":
        return "≠"
      case "greater_than":
        return ">"
      case "less_than":
        return "<"
      default:
        return search.searchType
    }
  }

  compactedFilter = search => {
    if (!search.operationType) {
      return `\`${search.key}\` ${this.compactedComparator(search)} \`${search.value}\``
    }
    else {
      return `(${this.compactedFilter(search.left)} ${search.operationType.toUpperCase()} ${this.compactedFilter(search.right)})`
    }
  }

  compactedStyle = style => {
    return {
      styling: _map(style.styles, (style) => `${style.styleName}: ${style.styleValue}`),
      filter: this.compactedFilter(style.propertySearch),
    }
  }

  render() {
    const challenge = this.props.challenge || _get(this.props, 'task.parent')
    if (!challenge) {
      return null
    }

    if (_isEmpty(challenge.taskStyles)) {
      return (
        <div>
          <FormattedMessage {...messages.noStyles} />
        </div>
      )
    }

    const styleDescriptions = _map(challenge.taskStyles, (style, index) => {
      const compacted = this.compactedStyle(style)
      // Trim any outer parenthesees from filter string
      compacted.filter = compacted.filter.replace(/(^\()|(\)$)/g,'')

      const markdownDescription = `### ${_join(compacted.styling, '\n### ')}\n\n${compacted.filter}`
      return (
        <div
          key={index}
          className={classNames({"mr-mt-4 mr-pt-4 mr-border-t mr-border-grey-light": index > 0})}
        >
          <MarkdownContent key={index} markdown={markdownDescription} />
        </div>
      )
    })

    return (
      <div>
        {styleDescriptions}
      </div>
    )
  }
}

export default injectIntl(FeatureStyleLegend)
