import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedDate } from 'react-intl'

export default class PersonalInfo extends Component {
  render() {
    return (
      <div className={classNames("user-profile__personal", this.props.className)}>
        <figure className="user-profile__personal--avatar image is-128x128">
          <img src={this.props.user.osmProfile.avatarURL} alt="Avatar" />
        </figure>

        <div className="user-profile__personal__about">
          <div className="user-profile__personal__display-name">
            {this.props.user.osmProfile.displayName}
          </div>
          <div className="user-profile__personal__created">
            User since: <span className="user-profile__personal__value">
              <FormattedDate month='long' year='numeric'
                            value={new Date(this.props.user.created)} />
            </span>
          </div>
        </div>
      </div>
    )
  }
}

PersonalInfo.propTypes = {
  user: PropTypes.object,
}
