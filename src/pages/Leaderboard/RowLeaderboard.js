import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _truncate from 'lodash/truncate'
import messages from './Messages'
import AsAvatarUser from '../../interactions/User/AsAvatarUser'

class RowLeaderboard extends Component {
  render() {
    const leader = this.props.leader

    const topChallengeItems =
      this.props.suppressTopChallenges ? null :
      _map(leader.topChallenges.slice(0, this.props.maxTopChallenges), challenge => (
        <li key={challenge.id}>
          <Link to={`/browse/challenges/${challenge.id}`} title={challenge.name}>
            {_truncate(challenge.name, {length: 35})}
          </Link>
        </li>
      ))

    return (
      <article className={classNames('mr-leaderboard-row', this.props.className)}>
        <div className="sm:mr-grid sm:mr-grid-columns-10 sm:mr-grid-gap-8">
          <header className="mr-mb-4 sm:mr-mb-0 sm:mr-col-span-4 md:mr-flex md:mr-items-center mr-text-center sm:mr-text-left">
            <div>
              <h3 className="mr-mb-2 md:mr-mb-0 mr-font-bold md:mr-pr-8">
                <FormattedNumber value={leader.rank} />
              </h3>
            </div>
            <div className="md:mr-flex mr-items-center">
              <div
                className="mr-block mr-w-20 mr-h-20 mr-bg-black mr-bg-cover mr-bg-center mr-mx-auto mr-rounded-full"
                style={{ backgroundImage: `url(${AsAvatarUser(leader).profilePic(200)})` }}
              />
              <div className="md:mr-pl-8">
                <h2 className="mr-text-lg mr-font-normal mr-mb-2">
                  {leader.name}
                </h2>
                <h4 className="mr-text-md mr-text-green-lighter">
                  <strong className="mr-text-green-lighter">
                    <FormattedNumber value={leader.score} />
                  </strong> <FormattedMessage {...messages.userPoints} />
                </h4>
              </div>
            </div>
          </header>
          {!this.props.suppressTopChallenges &&
           <div className="sm:mr-border-l sm:mr-border-white-10 sm:mr-pl-8 sm:mr-col-span-6 sm:mr-flex sm:mr-items-center mr-text-center sm:mr-text-left">
             <div>
               <h4 className="mr-text-base mr-font-medium mr-mb-1 mr-inline-block md:mr-block mr-border-b mr-pb-2 md:mr-pb-0 mr-mb-2 mr-border-white-40 md:mr-border-none">
                 <FormattedMessage {...messages.userTopChallenges} />
               </h4>
               <ol className="mr-list-reset md:mr-list-ruled mr-text-sm mr-links-inverse">
                 {topChallengeItems}
               </ol>
             </div>
           </div>
          }
        </div>
      </article>
    )
  }
}
RowLeaderboard.propTypes = {
  /** user to display on card */
  leader: PropTypes.shape({
    name: PropTypes.string.isRequired,
    rank: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired,
    avatarURL: PropTypes.string,
    topChallenges: PropTypes.array.isRequired,
  }).isRequired,

  /** maximum number of challenges to display on card */
  maxTopChallenges: PropTypes.number,
}

RowLeaderboard.defaultProps = {
  maxTopChallenges: 4,
}

export default RowLeaderboard
