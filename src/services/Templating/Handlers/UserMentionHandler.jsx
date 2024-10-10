import { Link } from 'react-router-dom'

/**
 * Expands user mentions, such as `[@username]`, into links to the mentioned
 * user's metrics page. This class will also normalize a simplfied `@username`
 * into the full form. Note that the simplified version cannot contain spaces
 * or punctuation -- the full form must be used for usernames containing any
 * non-word characters
 */
const OSMUserMentionHandler = {
  simpleMentionRegex: "(^|\\s+)(@[\\w]+)",
  mentionRegex: "@(.+)",

  /*
   * Convert any simple mentions into full short-code form, e.g. `@foo` into
   * `[@foo]`
   */
  normalizeContent(content) {
    return this.containsSimpleMention(content) ?
           content.replace(new RegExp(this.simpleMentionRegex, 'g'), "$1[$2]") :
           content
  },

  handlesShortCode(shortCode) {
    return new RegExp(this.mentionRegex).test(shortCode)
  },

  expandShortCode(shortCode) {
    if (new RegExp(this.mentionRegex).test(shortCode)) {
      const username = shortCode.slice(2, -1)
      return <Link to={`/user/metrics/${encodeURIComponent(username)}`}>@{username}</Link>
    }
    else {
      return shortCode
    }
  },

  /**
   * Determines if the given string content contains one or more simple user
   * mentions, excluding the full short-code form (i.e. `@foo` but not `[@foo]`)
   */
  containsSimpleMention(content) {
    return new RegExp(this.simpleMentionRegex).test(content)
  },
}

export default OSMUserMentionHandler
