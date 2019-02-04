import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedNumber, FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _truncate from 'lodash/truncate'
import _isFinite from 'lodash/isFinite'
import _get from 'lodash/get'
import _find from 'lodash/find'
import _each from 'lodash/each'
import WithLeaderboard from '../HOCs/WithLeaderboard/WithLeaderboard'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import WithDeactivateOnOutsideClick
       from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import LeaderboardMap from './LeaderboardMap'
import SimpleDropdown from '../Bulma/SimpleDropdown'
import PastDurationSelector from '../PastDurationSelector/PastDurationSelector'
import CountrySelector from '../CountrySelector/CountrySelector'
import MarkdownContent from '../MarkdownContent/MarkdownContent'
import BusySpinner from '../BusySpinner/BusySpinner'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import Ribbon from '../Ribbon/Ribbon'
import LoadMoreButton from '../LoadMoreButton/LoadMoreButton'
import messages from './Messages'
import './Leaderboard.css'

// Setup child components with needed HOCs.
const DeactivatableDropdown = WithDeactivateOnOutsideClick(SimpleDropdown)

const DEFAULT_TOP_LEADER_COUNT = 4;
const INITIAL_MONTHS_PAST = 1;

export class Leaderboard extends Component {
  topLeaderCount = () => _isFinite(this.props.topLeaderCount) ?
                         this.props.topLeaderCount :
                         DEFAULT_TOP_LEADER_COUNT

  buildBoard = (leader, withRibbon, isCurrentUser, optionalClass) => {
    const topChallenges = _map(leader.topChallenges.slice(0, this.topLeaderCount()), challenge => (
      <Link to={`/browse/challenges/${challenge.id}`}
            className="leaderboard__board__leader__top-challenges__challenge-name"
            key={challenge.id}
            title={challenge.name}>
        {_truncate(challenge.name, {length: 35})}
      </Link>
    ))

    return (
      <div className={classNames("leaderboard__board__leader", optionalClass,
                      {"current-user-leader": isCurrentUser})} key={leader.userId}>
        {withRibbon ?
          <Ribbon className="leaderboard__board__leader__rank">
            #{leader.rank}
          </Ribbon> :
          <div className="leaderboard__board__leader__rank">#{leader.rank}</div>
        }

        <figure className="leaderboard__board__leader__avatar image">
          <div className="circular-image"
               style={{backgroundImage: `url(${leader.avatarURL})`}} />
        </figure>

        <div className="leaderboard__board__leader__name-and-score">
          <div className="leaderboard__board__leader__name">{leader.name}</div>
          <div className="leaderboard__board__leader__score">
            <SvgSymbol sym="trophy-icon" viewBox="0 0 20 20"
                       className="leaderboard__board__leader__score__trophy" />
            <span className="score-value"><FormattedNumber value={leader.score} /></span>
            <FormattedMessage {...messages.userPoints} />
          </div>
        </div>

        {!this.props.suppressTopChallenges &&
         <div className="leaderboard__board__leader__top-challenges">
           <h3>
             <FormattedMessage {...messages.userTopChallenges} />
           </h3>
           <div className="leaderboard__board__leader__top-challenges__challenge-list">
             {topChallenges}
           </div>
         </div>
        }
      </div>
    )
  }

  leaderGroup = (leaders, withRibbon=false, addUserboard=false) => {
    const currentUserId = _get(this.props, 'user.id')
    let resultsIncludeUser = false

    const builtBoards = _map(leaders, (leader, index) => {
      if (leader.userId === currentUserId) {
        resultsIncludeUser = true
      }

      return this.buildBoard(leader, withRibbon, leader.userId === currentUserId)
    })

    if (addUserboard && currentUserId && !resultsIncludeUser) {
      _each(this.props.userLeaderboard, (board) => {
        if (!_find(this.props.leaderboard, {userId: board.userId})) {
          builtBoards.push(this.buildBoard(board, withRibbon,
            currentUserId === board.userId, "current-user-leader-bracket"))
        }
      })
    }
    return builtBoards
  }

  render() {
    if (process.env.REACT_APP_FEATURE_LEADERBOARD !== 'enabled') {
      return null
    }
    else if (this.props.leaderboardLoading && !this.props.leaderboard) {
      return (
        <div className={classNames({"pane-loading": !this.props.compactView})}>
          <BusySpinner />
        </div>
      )
    }
    else if (!this.props.leaderboard) {
      return null
    }

    return (
      <div className={classNames("leaderboard", {"leaderboard--compact-view": this.props.compactView})}>
        <div className="leaderboard__obstruct-footer-icon" />
        <div className="leaderboard__board">
          {!this.props.suppressHeader &&
           <div className="leaderboard__board__header">
             <h1 className="title">
              <FormattedMessage {...messages.leaderboardTitle} />
              <PastDurationSelector className="leaderboard__board__header__dates-control"
                                    pastMonthsOptions={[1, 3, 6, 12]}
                                    currentMonthsPast={this.props.monthsPast}
                                    selectDuration={this.props.setMonthsPast} />

              <CountrySelector className="leaderboard__board__header__country-control"
                               currentCountryCode={this.props.countryCode}
                               selectCountry={this.props.setCountryCode} />
             </h1>

             <div className="leaderboard__board__header__point-breakdown">
               <SvgSymbol sym="trophy-icon" viewBox="0 0 20 20" />
               <DeactivatableDropdown isRight
                                      label={this.props.intl.formatMessage(messages.scoringMethodLabel)}>
                 <MarkdownContent markdown={this.props.intl.formatMessage(messages.scoringExplanation)}
                                  className="leaderboard__board__header__point-breakdown__explanation" />
               </DeactivatableDropdown>
             </div>
           </div>
          }
          {this.props.displayName &&
            <h1 className="leaderboard__board__display-name">{this.props.displayName}</h1>
          }

          {_get(this.props, "leaderboardOptions.filterCountry") &&
            <LeaderboardMap {...this.props}/>
          }

          {this.props.leaderboard.length === 0 &&
           <div className="leaderboard__board__no-leaders">
             <FormattedMessage {...messages.noLeaders} />
           </div>
          }

          {this.topLeaderCount() > 0 &&
           <div className="leaderboard__board__top-leaders">
             {this.leaderGroup(this.props.leaderboard.slice(0, this.topLeaderCount()), true, false)}
           </div>
          }

          {this.props.leaderboard.length > this.topLeaderCount() &&
           <div className="leaderboard__board__remaining-leaders">
             {this.leaderGroup(this.props.leaderboard.slice(this.topLeaderCount()), false,
                               !_find(this.props.leaderboard, {userId: _get(this.props, 'user.id')}))}
           </div>
          }

          <div className="leaderboard__board__load-more-results">
            <LoadMoreButton {...this.props}>
              <FormattedMessage {...messages.loadMoreLabel} />
            </LoadMoreButton>
          </div>
        </div>

        <SvgSymbol sym="leaderboard-footer-icon" viewBox="0 0 1680 666"
                   className="leaderboard__footer-icon" />
      </div>
    )
  }
}

Leaderboard.propTypes = {
  leaderboard: PropTypes.array,
  leaderboardLoading: PropTypes.bool,
  /** Number of leaders to show as top leaders. Defaults to 4 */
  topLeaderboardCount: PropTypes.number,
  /** Set to true to suppress display of users' top challenges */
  suppressTopChallenges: PropTypes.bool,
  /** Set to true to render in the compact view */
  compactView: PropTypes.bool,
  /** Optional displayName to show in title */
  displayName: PropTypes.string,
}

export default WithCurrentUser(
  WithLeaderboard(injectIntl(Leaderboard), INITIAL_MONTHS_PAST)
)
