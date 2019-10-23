import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import remark from 'remark'
import externalLinks from 'remark-external-links'
import reactRenderer from 'remark-react'
import { expandShortCodesInJSX } from '../../services/ShortCodes/ShortCodes'

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

    // Replace any occurrences of \r\n with newlines.
    const normalizedMarkdown = this.props.markdown.replace(/\r\n/mg, "\n\n")
    let parsedMarkdown =
      remark().use(externalLinks, {target: '_blank', rel: ['nofollow']})
              .use(reactRenderer).processSync(normalizedMarkdown).contents

    if (this.props.allowShortCodes) {
      parsedMarkdown = expandShortCodesInJSX(parsedMarkdown)
    }

    return (
      <div
        className={classNames(
          'mr-markdown',
          {'mr-markdown--light': this.props.lightMode},
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
}
