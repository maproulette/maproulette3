import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import './CommentCountBadge.scss'

/**
 * CommentCountBadge renders an icon with a Bulma badge containing a count of
 * the comments in the given comment list.
 *
 * @see See https://wikiki.github.io/elements/badge/
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CommentCountBadge extends Component {
  render() {
    return (
      <div className={classNames("comment-count-badge", this.props.className)}>
        <span className={classNames("badge is-badge-outlined",
                                    {"is-empty": this.props.comments.length === 0})}
              data-badge={this.props.comments.length}>
          <SvgSymbol viewBox='0 0 20 20' sym="chat-icon" />
        </span>
      </div>
    )
  }
}

CommentCountBadge.propTypes = {
  comments: PropTypes.array,
  tooltip: PropTypes.string,
}

CommentCountBadge.defaultProps = {
  comments: [],
}
