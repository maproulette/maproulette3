import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

export default class CardNews extends Component {
  render() {
    return (
      <article className={classNames('mr-card-news', this.props.className)}>
        {this.props.data.featuredImage && (
          <figure className="mr-card-news__image">
            <Link to={this.props.data.link}>
              <img
                src={this.props.data.featuredImage.standard}
                srcSet={`${this.props.data.featuredImage.standard} 1x, ${
                  this.props.data.featuredImage.at2x
                } 2x`}
                alt="News Article"
              />
            </Link>
          </figure>
        )}
        <h3 className="mr-card-news__title">
          <Link to={this.props.data.link}>{this.props.data.title}</Link>
        </h3>
        <div className="mr-card-news__pubdate">
          Posted on <time dateTime="">{this.props.data.date}</time>
        </div>
        <div className="mr-card-news__intro">
          <p>{this.props.data.summary}</p>
        </div>
        <Link to={this.props.data.link} className="mr-button mr-button--green">
          Read More
        </Link>
      </article>
    )
  }
}

CardNews.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object.isRequired,
}
