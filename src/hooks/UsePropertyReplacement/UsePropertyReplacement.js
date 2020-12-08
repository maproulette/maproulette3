import { useState, useEffect } from 'react'
import _get from 'lodash/get'

/**
 * Replaces mustache tags (e.g. `{{foo}}`) found in content with values found
 * in properties, or empty string if no matching property is found
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const usePropertyReplacement = (content, properties, allowPropertyReplacement=true) => {
  const [replacedContent, setReplacedContent] = useState(null)

  useEffect(() => {
    if (content && allowPropertyReplacement) {
      setReplacedContent(replacePropertyTags(content, properties))
    }
    else {
      setReplacedContent(content)
    }
  }, [content, properties, allowPropertyReplacement])

  return replacedContent
}

export const replacePropertyTags = (content, properties, errOnMissing=false) => {
  return content.replace(
    /(^|[^{])\{\{([^{][^}]*)}}/g,
    (matched, firstChar, tagName) => {
      if (errOnMissing && !properties[tagName]) {
        throw new Error(`Missing replacement property: ${tagName}`)
      }
      return firstChar + _get(properties, tagName, '')
    }
  )
}

export default usePropertyReplacement
