import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import remark from 'remark'
import externalLinks from 'remark-external-links'
import reactRenderer from 'remark-react'
import _get from 'lodash/get'
import { expandTemplatingInJSX } from '../../services/Templating/Templating'

/**
 * MarkdownContent normalizes and renders the content of the given markdown
 * string as formatted Markdown.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MarkdownContent extends Component {
  render() {
    if (!this.props.markdown) {
      return null
    }

    // Replace any occurrences of \r\n with newlines, and since we don't
    // support <br> tags replace `  \n` with `\n\n` to generate a new paragraph
    // instead
    let normalizedMarkdown =
      this.props.markdown.replace(/\r\n/mg, "\n\n").replace(/\s{2}\n/mg, "\n\n")

    // If property replacement is active, replace mustache tags (e.g.
    // `{{foo}}`) with given property values prior to parsing markdown
    if (this.props.allowPropertyReplacement) {
      normalizedMarkdown = normalizedMarkdown.replace(
        /(^|[^{])\{\{([^{][^}]*)}}/g,
        (matched, firstChar, tagName) => firstChar + _get(this.props, `properties.${tagName}`, '')
      )
    }

    let parsedMarkdown =
      remark().use(externalLinks, {target: '_blank', rel: ['nofollow']})
              .use(reactRenderer).processSync(normalizedMarkdown).result

    if (this.props.allowShortCodes) {
      parsedMarkdown = expandTemplatingInJSX(parsedMarkdown, this.props)
    }

    return (
      <div
        className={classNames(
          'mr-markdown',
          {'mr-markdown--compact': this.props.compact},
          this.props.className
        )}
      >
        {parsedMarkdown}
      </div>
    )
  }
}

MarkdownContent.propTypes = {
  className: PropTypes.string,
  markdown: PropTypes.string,
  allowShortCodes: PropTypes.bool,
  allowFormFields: PropTypes.bool,
  allowPropertyReplacement: PropTypes.bool,
}

MarkdownContent.defaultProps = {
  allowShortCodes: false,
  allowPropertyReplacement: false,
  allowFormFields: false,
}
