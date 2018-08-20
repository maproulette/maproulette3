import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import subMonths from 'date-fns/sub_months'
import PastDurationSelector
       from '../../PastDurationSelector/PastDurationSelector'
import messages from './Messages'

export default class TopChallenges extends Component {
  state = {
    monthsPast: 1,
  }

  selectDateRange = monthsPast => {
    this.setState({monthsPast})
    this.props.fetchTopChallenges(this.props.user.id,
                                  subMonths(new Date(), monthsPast))
  }

  render() {
    const challengeItems =
      _compact(_map(_get(this.props, 'user.topChallenges', []), challenge => {
        if (!_isFinite(_get(challenge, 'id'))) {
          return null
        }

        return (
          <li key={challenge.id} className="user-profile__top-challenges__challenge">
            <Link to={`/browse/challenges/${challenge.id}`}>
              {challenge.name}
            </Link>
          </li>
        )
      }
    ))

    const topChallenges = challengeItems.length > 0 ?
                          <ul>{challengeItems}</ul> :
                          <div className="none">No Challenges</div>

    return (
      <div className={classNames("user-profile__top-challenges", this.props.className)}>
        <h2 className="subtitle">
          <FormattedMessage {...messages.header} />
          <PastDurationSelector className="user-profile__top-challenges__dates-control"
                                pastMonthsOptions={[1, 3, 6, 12]}
                                currentMonthsPast={this.state.monthsPast}
                                selectDuration={this.selectDateRange} />
        </h2>

        {topChallenges}
      </div>
    )
  }
}

TopChallenges.propTypes = {
  user: PropTypes.object.isRequired,
}
