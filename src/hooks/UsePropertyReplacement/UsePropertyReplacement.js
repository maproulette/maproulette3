import _get from "lodash/get";
import { useEffect, useState } from "react";

/**
 * Replaces mustache tags (e.g. `{{foo}}`) found in content with values found
 * in properties, or empty string if no matching property is found
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const usePropertyReplacement = (content, properties, allowPropertyReplacement = true) => {
  const [replacedContent, setReplacedContent] = useState(null);

  useEffect(() => {
    if (content && allowPropertyReplacement) {
      // Preprocess markdown links that contain mustache replacements in the URL part
      if (hasMarkdownLinkMustacheCharacters(content)) {
        content = preProcessMarkdownLinks(content, properties);
      }

      setReplacedContent(replacePropertyTags(content, properties));
    } else {
      setReplacedContent(content);
    }
  }, [content, properties, allowPropertyReplacement]);

  return replacedContent;
};

// Match and process markdown links that contain mustache {{...}} replacements in the URL part
function preProcessMarkdownLinks(content, properties) {
  const urlRegex = /\]\s*\(([^)]*\{\{[^}]*\}\}[^)]*)\)/g;

  return content.replace(urlRegex, (match, url) => {
    // Transform the URL
    const replacedContent = replacePropertyTags(url, properties, false, false);
    // Return the unchanged part + transformed URL in parentheses
    return `](${replacedContent})`;
  });
}

// Lightweight check for markdown links plausibly requiring preprocessing
const hasMarkdownLinkMustacheCharacters = (text) => {
  return (
    text.includes("[") &&
    text.includes("]") &&
    text.includes("{") &&
    text.includes("}") &&
    text.includes("(") &&
    text.includes(")")
  );
};

export const replacePropertyTags = (
  content,
  properties,
  errOnMissing = false,
  urlEncodeReplacement = false,
) => {
  return content.replace(/(^|[^{])\{\{([^{][^}]*)}}/g, (matched, firstChar, tagName) => {
    if (errOnMissing && !properties[tagName]) {
      throw new Error(`Missing replacement property: ${tagName}`);
    }

    // Conditionally url encode replacement value
    const replacement = _get(properties, tagName, "");
    return firstChar + (urlEncodeReplacement ? encodeURIComponent(replacement) : replacement);
  });
};

export default usePropertyReplacement;
