import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _truncate from 'lodash/truncate'
import messages from './Messages'
import AsAvatarUser from '../../interactions/User/AsAvatarUser'

class CardLeaderboard extends Component {
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
      <article
        className={classNames(
          'mr-relative mr-bg-white-10 mr-text-white mr-rounded mr-p-4 md:mr-p-6 mr-shadow mr-text-center',
          this.props.className
        )}
      >
        <header className="mr-max-w-xs mr-mx-auto mr-mb-2">
          <div
            className="mr-block mr-w-24 mr-h-24 mr-bg-black mr-bg-cover mr-bg-center mr-mx-auto mr-mb-4 mr-rounded-full"
            style={{ backgroundImage: `url(${AsAvatarUser(leader).profilePic(200)})` }}
          />
          <h2 className="mr-h4 mr-mb-1">
            <span className="mr-text-4xl mr-font-bold mr-absolute mr-pin-l mr-pin-t mr-mt-6 mr-ml-6">
              <FormattedNumber value={leader.rank} />
            </span>
            {leader.name}
          </h2>
        </header>
        <h3 className="mr-h2 mr-mb-4 mr-text-green-lighter">
          <strong className="mr-font-bold mr-text-green-lighter">
            <FormattedNumber value={leader.score} />
          </strong> <FormattedMessage {...messages.userPoints} />
        </h3>
        {!this.props.suppressTopChallenges &&
         <React.Fragment>
           <h4 className="mr-inline-block mr-text-md mr-pb-3 mr-mb-3 mr-border-b mr-border-white-40">
             <FormattedMessage {...messages.userTopChallenges} />
           </h4>
           <ol className="mr-list-reset mr-text-sm mr-links-inverse">
             {topChallengeItems}
           </ol>
         </React.Fragment>
        }
      </article>
    )
  }
}

CardLeaderboard.propTypes = {
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

CardLeaderboard.defaultProps = {
  maxTopChallenges: 4,
}

export default CardLeaderboard
