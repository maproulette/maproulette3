import React from 'react'
import _find from 'lodash/find'
import _compact from 'lodash/compact'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _isString from 'lodash/isString'
import _uniqueId from 'lodash/uniqueId'

import OSMElementHandler from './Handlers/OSMElementHandler'
import OSMViewportHandler from './Handlers/OSMViewportHandler'

// All available short-code handlers
const shortCodeHandlers = [OSMElementHandler, OSMViewportHandler]

// Short codes are surrounded by brackets, but -- to avoid confusion with
// Markdown links -- cannot be immediately followed by an open parenthesees
// (hence the lookahead at the end)
const shortCodeRegex = /(\[[^\]]+\])(?=[^(]|$)/g

/**
 * Recursively runs through the given JSX element tree and expands any
 * short-codes found within the element child content (not props), returning a
 * cloned copy of the element tree with supported short-codes expanded
 */
export const expandShortCodesInJSX = function(jsxNode) {
  return React.cloneElement(
    jsxNode,
    {},
    _map(jsxNode.props.children, child => {
      if (_isString(child)) {
        if (!containsShortCode(child)) {
          return child
        }

        return _map(tokenize(child), token => (
          <span key={_uniqueId('sc-')}>{expandedTokenContent(token)}</span>
        ))
      }
      else {
        return expandShortCodesInJSX(child)
      }
    })
  )
}

/**
 * Determines if the given string content contains one or more short-codes
 */
export const containsShortCode = function(content) {
  return shortCodeRegex.test(content)
}

/**
 * Runs through the available short-code handlers to find one that is capable
 * of handling the given short-code, asks that handler to expand the
 * short-code, and returns the expanded results
 */
export const expandShortCode = function(shortCode) {
  const targetHandler =
    _find(shortCodeHandlers, handler => handler.handlesShortCode(shortCode))

  if (!targetHandler) {
    // Unsupported short code, just return it as-is
    return shortCode
  }

  return targetHandler.expandShortCode(shortCode)
}

/**
 * Tokenizes string content into an array to separate out short-codes from the
 * rest of the content. Each element is either content free of short-codes or a
 * single short-code
 */
export const tokenize = function(content) {
  if (!content) {
    return []
  }

  return _compact(_map(
    // Clear out any empty tokens
    content.split(shortCodeRegex), token => _isEmpty(token) ? null : token
  ))
}

/**
 * Determines if the given token (from the tokenize function) represents a
 * short-code
 */
export const isShortCodeToken = function(token) {
  return token.length > 2 && token[0] === '[' && token[token.length - 1] === ']'
}

/**
 * Returns appropriate content for the given token, either an expanded short
 * code if the token represents a short-code or the original content if not
 */
export const expandedTokenContent = function(token) {
  return isShortCodeToken(token) ? expandShortCode(token) : token
}
