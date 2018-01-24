import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedDate, FormattedTime } from 'react-intl'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import { map as _map,
         isObject as _isObject,
         sortBy as _sortBy,
         reverse as _reverse } from 'lodash'
import './CommentList.css'

/**
 * CommentList renders the given comments as a list with some basic formatting,
 * starting with the most recent comment.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CommentList extends Component {
  render() {
    if (this.props.comments.length === 0) {
      return <div className="comment-list none">No Comments</div>
    }

    // Show in descending order, with the most recent comment first.
    const sortedComments = _reverse(_sortBy(this.props.comments, 'created'))

    const commentItems = _map(sortedComments, comment =>
      !_isObject(comment) ? null : (
        <li key={comment.id} className="comment-list__comment">
          <div className="comment-list__comment__header">
            <div className="comment-list__comment--author">
              {comment.osm_username}
            </div>
            <div className="comment-list__comment--published-at">
              <span className="time-part">
                <FormattedTime value={new Date(comment.created)}
                              hour='2-digit'
                              minute='2-digit' />,
              </span>

              <span className="date-part">
                <FormattedDate value={new Date(comment.created)}
                              year='numeric'
                              month='long'
                              day='2-digit' />
              </span>
            </div>
          </div>

          <div className="with-triangle-border">
            <MarkdownContent className="comment-list__comment--content"
                            markdown={comment.comment} />
          </div>
        </li>
      )
    )

    return (
      <ul className={classNames('comment-list', this.props.className)}>
        {commentItems}
      </ul>
    )
  }
}

CommentList.propTypes = {
  /** The comments to display */
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      osm_username: PropTypes.string,
      comment: PropTypes.string,
      created: PropTypes.number,
    })
  ),
}

CommentList.defaultProps = {
  comments: [],
}
