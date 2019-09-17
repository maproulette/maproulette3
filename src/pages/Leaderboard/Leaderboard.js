import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, injectIntl } from 'react-intl'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _isEmpty from 'lodash/isEmpty'
import WithLeaderboard
       from '../../components/HOCs/WithLeaderboard/WithLeaderboard'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import PastDurationSelector
       from '../../components/PastDurationSelector/PastDurationSelector'
import {ALL_TIME, CURRENT_MONTH}
       from '../../components/PastDurationSelector/PastDurationSelector'
import CountrySelector
       from '../../components/CountrySelector/CountrySelector'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import CardLeaderboard from './CardLeaderboard'
import RowLeaderboard from './RowLeaderboard'
import LeaderboardMap from './LeaderboardMap'
import messages from './Messages'

const INITIAL_MONTHS_PAST = -1;

class Leaderboard extends Component {
  loggedInUserMissing = () => {
    return this.props.userLeaderboard
  }

  render() {
    if (!this.props.leaderboard) {
      return (
        <section className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12">
          <div className="mr-max-w-2xl mr-mx-auto">
            <BusySpinner />
          </div>
        </section>
      )
    }

    const loggedInUserId = _get(this.props, 'user.id')

    const topLeaderCards = _map(
      this.props.leaderboard.slice(0, this.props.topLeaderCount), leader =>
      <CardLeaderboard
        {...this.props}
        className="mr-mb-8"
        key={leader.userId}
        leader={leader}
      />
    )

    const remainingLeaders = this.props.leaderboard.slice(this.props.topLeaderCount)
    const remainingLeaderRows = _map(remainingLeaders, (leader, index) =>
      <RowLeaderboard
        {...this.props}
        className={classNames("mr-mb-8", {
          "mr-leaderboard-row--active": leader.userId === loggedInUserId,
          "mr-mt-24": index > 0 && (leader.rank - remainingLeaders[index - 1].rank > 1),
        })}
        key={leader.userId}
        leader={leader}
      />
    )

    return (
      <section className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12">
      <div className="mr-max-w-6xl mr-mx-auto mr-bg-fireworks">
        <div className="mr-max-w-2xl mr-mx-auto">
          <header className="mr-mb-8 mr-rounded mr-bg-white-10 mr-shadow mr-p-4 md:mr-px-6 md:mr-py-8 lg:mr-flex lg:mr-justify-between mr-text-white mr-text-center lg:mr-text-left">
            <div className="mr-max-w-md mr-mb-4 lg:mr-mb-0 lg:mr-pr-8">
              <h1 className="mr-h2 mr-mb-2">
                {this.props.displayName ?
                 this.props.displayName :
                 <FormattedMessage {...messages.leaderboardGlobal} />
                } <FormattedMessage {...messages.leaderboardTitle} />
              </h1>
              <h3 className="mr-text-sm mr-text-yellow mr-uppercase mr-tracking-wide mr-font-normal">
                {this.props.countryCode ?
                 <FormattedMessage {...messages.updatedDaily} /> :
                 <FormattedMessage {...messages.updatedFrequently} />
                }
              </h3>
            </div>
            <div className="mr-flex mr-justify-center mr-mb-2">
              <PastDurationSelector
                className="mr-button mr-mr-8"
                pastMonthsOptions={[ALL_TIME, CURRENT_MONTH, 1, 3, 6, 12]}
                currentMonthsPast={this.props.monthsPast}
                selectDuration={this.props.setMonthsPast}
              />
              {!this.props.suppressCountrySelection &&
               <CountrySelector
                 className="mr-button"
                 currentCountryCode={this.props.countryCode}
                 selectCountry={this.props.setCountryCode}
               />
              }
            </div>
          </header>

          {_get(this.props, "leaderboardOptions.filterCountry") &&
            <LeaderboardMap {...this.props} className="mr-mb-8 mr-rounded mr-shadow" />
          }

          <div className="sm:mr-grid sm:mr-grid-columns-2 md:mr-grid-columns-3 sm:mr-grid-gap-8">
            {topLeaderCards}
          </div>
          {remainingLeaderRows}

          {_isEmpty(this.props.leaderboard) &&
           <h3 className="mr-h3 mr-mb-2 mr-text-white mr-text-center">
             <FormattedMessage {...messages.noLeaders} />
           </h3>
          }
        </div>
        </div>
      </section>
    )
  }
}

Leaderboard.propTypes = {
  leaderboard: PropTypes.array,
  topLeaderCount: PropTypes.number,
  suppressCountrySelection: PropTypes.bool,
  user: PropTypes.object,
}

Leaderboard.defaultProps = {
  topLeaderCount: 3,
  suppressCountrySelection: false,
}

export default
  WithCurrentUser(
    WithLeaderboard(injectIntl(Leaderboard), INITIAL_MONTHS_PAST)
  )
