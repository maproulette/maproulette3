import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import remark from 'remark'
import externalLinks from 'remark-external-links'
import reactRenderer from 'remark-react'
import { expandTemplatingInJSX } from '../../services/Templating/Templating'
import usePropertyReplacement
       from '../../hooks/UsePropertyReplacement/UsePropertyReplacement'

/**
 * MarkdownContent normalizes and renders the content of the given markdown
 * string as formatted Markdown.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const MarkdownContent = props => {
  const [normalizedMarkdown, setNormalizedMarkdown] = useState(null)
  const [parsedMarkdown, setParsedMarkdown] = useState(null)
  const [expandedMarkdown, setExpandedMarkdown] = useState(null)
  const { markdown, properties, allowPropertyReplacement, allowShortCodes } = props

  useEffect(() => {
    if (markdown) {
      // Normalize. Replace any occurrences of \r\n with newlines, and since we
      // don't support <br> tags replace `  \n` with `\n\n` to generate a new
      // paragraph instead
      setNormalizedMarkdown(
        markdown.replace(/\r\n/mg, "\n\n").replace(/\s{2}\n/mg, "\n\n")
      )
    }
  }, [markdown])

  const replacedMarkdown =
    usePropertyReplacement(normalizedMarkdown, properties, allowPropertyReplacement)

  useEffect(() => {
    if (replacedMarkdown) {
      setParsedMarkdown(
        remark().use(externalLinks, {target: '_blank', rel: ['nofollow']})
                .use(reactRenderer).processSync(replacedMarkdown).result
      )
    }
  }, [replacedMarkdown])

  useEffect(() => {
    if (parsedMarkdown) {
      setExpandedMarkdown(
        allowShortCodes ?
        expandTemplatingInJSX(parsedMarkdown, props) :
        parsedMarkdown
      )
    }
  }, [parsedMarkdown, allowShortCodes, props])

  if (!expandedMarkdown) {
    return null
  }

  return (
    <div
      className={classNames(
        'mr-markdown',
        {'mr-markdown--compact': props.compact},
        props.className
      )}
    >
      {expandedMarkdown}
    </div>
  )
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

export default MarkdownContent
