import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage,
         FormattedDate,
         FormattedTime } from 'react-intl'
import { Link } from 'react-router-dom'
import parse from 'date-fns/parse'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import _sortBy from 'lodash/sortBy'
import _reverse from 'lodash/reverse'
import _each from 'lodash/each'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import messages from './Messages'

/**
 * CommentList renders the given comments as a list with some basic formatting,
 * starting with the most recent comment.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class CommentList extends Component {
  render() {
    if (this.props.comments.length === 0) {
      return (
        <div className="mr-px-4 mr-text-grey-light">
          <FormattedMessage {...messages.noComments} />
        </div>
      )
    }

    const commentDates = new Map()
    _each(this.props.comments,
          comment => commentDates.set(comment.id, parse(comment.created)))

    // Show in descending order, with the most recent comment first.
    const sortedComments =
      _reverse(_sortBy(this.props.comments,
                       comment => commentDates.get(comment.id).getTime()))

    const commentItems = _map(sortedComments, comment =>
      !_isObject(comment) ? null : (
        <article key={comment.id} className="mr-pr-4 mr-mt-4">
          <div className="mr-mb-2 mr-text-xs">
            <span className="mr-font-bold">
              <FormattedTime
                value={commentDates.get(comment.id)}
                hour='2-digit'
                minute='2-digit'
              />, <FormattedDate
                value={commentDates.get(comment.id)}
                year='numeric'
                month='long'
                day='2-digit'
              />
            </span> &mdash; {comment.osm_username}
          </div>
          {(this.props.includeChallengeNames || this.props.includeTaskLinks) &&
            <div className="mr-flex mr-justify-between mr-text-xs mr-links-green-lighter mr-mb-2">
              {this.props.includeChallengeNames &&
               <div className="mr-text-white">{comment.challengeName}</div>
              }
              {this.props.includeTaskLinks &&
               <Link to={`/challenge/${comment.challengeId}/task/${comment.taskId}`}>
                 <FormattedMessage {...messages.viewTaskLabel} />
               </Link>
              }
            </div>
          }
          <div
            className={classNames(
              "mr-text-sm mr-rounded-sm mr-p-2 mr-mb-8",
              this.props.lightMode ? "mr-bg-grey-lighter" : "mr-bg-black-15 mr-shadow-inner mr-text-grey-lighter"
            )}
          >
            <MarkdownContent allowShortCodes markdown={comment.comment} />
          </div>
        </article>
      )
    )

    return (
      <React.Fragment>{commentItems}</React.Fragment>
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
      created: PropTypes.string,
    })
  ),
  /**
   * Set to true to include a link to the task on which the comment appears
   */
  includeTaskLinks: PropTypes.bool,
}

CommentList.defaultProps = {
  comments: [],
  includeTaskLinks: false,
}
