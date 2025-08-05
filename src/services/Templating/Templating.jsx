import _compact from "lodash/compact";
import _find from "lodash/find";
import _isEmpty from "lodash/isEmpty";
import _isString from "lodash/isString";
import _map from "lodash/map";
import _uniqueId from "lodash/uniqueId";
import { cloneElement } from "react";

import CheckboxFormHandler from "./Handlers/CheckboxFormHandler";
import CopyableTextHandler from "./Handlers/CopyableTextHandler";
import OSMElementHandler from "./Handlers/OSMElementHandler";
import OSMViewportHandler from "./Handlers/OSMViewportHandler";
import SelectFormHandler from "./Handlers/SelectFormHandler";
import UserMentionHandler from "./Handlers/UserMentionHandler";

// All available short-code handlers
const shortCodeHandlers = [
  OSMElementHandler,
  OSMViewportHandler,
  UserMentionHandler,
  CheckboxFormHandler,
  SelectFormHandler,
  CopyableTextHandler,
];

// Short codes are surrounded by brackets, but -- to avoid confusion with
// Markdown links -- cannot be immediately followed by an open parenthesees
// (hence the lookahead at the end). Alternatively, triple curly braces can be
// used
const shortCodeRegex = /(\{\{\{[^}]+}}})|(\[[^\]]+\])(?=[^(]|$)/;

/**
 * Determines if the given string content contains one or more short-codes
 */
export const containsShortCode = function (content) {
  return shortCodeRegex.test(content);
};

/**
 * Runs through the available short-code handlers to find one that is capable
 * of handling the given short-code, asks that handler to expand the
 * short-code, and returns the expanded results
 */
export const expandShortCode = function (shortCode, props) {
  const targetHandler = _find(shortCodeHandlers, (handler) =>
    handler.handlesShortCode(shortCode, props),
  );

  if (!targetHandler) {
    // Unsupported short code, just return it as-is
    return shortCode;
  }

  return targetHandler.expandShortCode(shortCode, props);
};

/**
 * Tokenizes string content into an array to separate out short-codes from the
 * rest of the content. Each element is either content free of short-codes or a
 * single short-code
 */
export const tokenize = function (content) {
  if (!content) {
    return [];
  }

  return _compact(
    _map(
      // Clear out any empty tokens
      content.split(shortCodeRegex),
      (token) => (_isEmpty(token) ? null : token),
    ),
  );
};

/**
 * Determines if the given token (from the tokenize function) represents a
 * short-code. We check the regex and also make sure the string starts and ends
 * with brackets or curly braces
 */
export const isShortCodeToken = function (token) {
  return (
    containsShortCode(token) &&
    ((token[0] === "[" && token[token.length - 1] === "]") ||
      (token[0] === "{" && token[token.length - 1] === "}"))
  );
};

/**
 * Returns appropriate content for the given token, either an expanded short
 * code if the token represents a short-code or the original content if not
 */
export const expandedTokenContent = function (token, props) {
  return isShortCodeToken(token) ? expandShortCode(token, props) : token;
};

/**
 * Processes text content and expands short codes if present.
 * This is a consolidated function that can be used by both JSX and Markdown components.
 */
export const processTextContent = function (content, props) {
  if (!content || typeof content !== "string") {
    return content;
  }

  // Normalize content using handlers
  let normalizedContent = content;
  for (const handler of shortCodeHandlers) {
    if (handler.normalizeContent) {
      normalizedContent = handler.normalizeContent(normalizedContent, props);
    }
  }

  if (!containsShortCode(normalizedContent)) {
    return normalizedContent;
  }

  // Tokenize and process short codes
  const tokens = tokenize(normalizedContent);
  return _map(tokens, (token) => {
    if (isShortCodeToken(token)) {
      return <span key={_uniqueId("sc-")}>{expandedTokenContent(token, props)}</span>;
    }
    return token;
  });
};
