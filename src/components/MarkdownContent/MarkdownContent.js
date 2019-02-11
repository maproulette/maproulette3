import React, { Component } from 'react'
import PropTypes from 'prop-types'
import remark from 'remark'
import externalLinks from 'remark-external-links'
import reactRenderer from 'remark-react'

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

    return (
      <div>
        {
          remark().use(externalLinks, {target: '_blank', rel: ['nofollow']})
                  .use(reactRenderer).processSync(normalizedMarkdown).contents
        }
      </div>
    )
  }
}

MarkdownContent.propTypes = {
  markdown: PropTypes.string,
}
