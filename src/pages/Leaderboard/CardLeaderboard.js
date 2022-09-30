import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _truncate from 'lodash/truncate'
import messages from './Messages'
import AsAvatarUser from '../../interactions/User/AsAvatarUser'
import './Leaderboard.scss'

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

    function onHover(value) {
      const name = value ? document.getElementById('profile-name-' + value) : null
      const pic = value ? document.getElementById('profile-pic-' + value) : null

      if (pic) {
        pic.style.border = '2px solid #7EBC89'
        pic.style.outline = '2px solid #7EBC89'
        pic.style.outlineOffset = '4px'
      }

      if (name) {
        name.style.color = '#7EBC89'
      }
    }

    function onLeave(value) {
      const name = value ? document.getElementById('profile-name-' + value) : null
      const pic = value ? document.getElementById('profile-pic-' + value) : null

      if (pic) {
        pic.style.border = null
        pic.style.outline = null
        pic.style.outlineOffset = '-8px'
      }
      if(name) {
        name.style.color = '#fff'
      }
    }

    return (
      <article
        className={classNames(
          'mr-relative mr-bg-black-10 mr-text-white mr-rounded mr-p-4 md:mr-p-6 mr-shadow mr-text-center',
          this.props.className
        )}
      >
        <header className="mr-max-w-xs mr-mx-auto mr-mb-2">
          <a
            href={'https://www.openstreetmap.org/user/' + leader.name} target="_blank" rel="noreferrer"
            className="mr-block mr-w-24 mr-h-24 mr-bg-black mr-bg-cover mr-bg-center mr-mx-auto mr-mb-4 mr-rounded-full card-pic"
            style={{ backgroundImage: `url(${AsAvatarUser(leader).profilePic(256)})` }}
            onMouseOver={() => onHover(leader.name)}
            onMouseLeave={() => onLeave(leader.name)}
            id={'profile-pic-' + leader.name}
          />
          <h2 className="mr-h4 mr-mb-1">
            <span className="mr-text-4xl mr-font-bold mr-absolute mr-left-0 mr-top-0 mr-mt-6 mr-ml-6">
              <FormattedNumber value={leader.rank} />
            </span>
            <a 
              href={'https://www.openstreetmap.org/user/' + leader.name} target="_blank" rel="noreferrer" 
              className="mr-text-white card-name"
              onMouseOver={() => onHover(leader.name)}
              onMouseLeave={() => onLeave(leader.name)}
              id={'profile-name-' + leader.name}
            >
              {leader.name}
            </a>
          </h2>
        </header>
        <h3 className="mr-h2 mr-mb-4 mr-text-yellow">
          <strong className="mr-font-bold mr-text-yellow">
            <FormattedNumber value={leader.score} />
          </strong> <FormattedMessage {...messages.userPoints} />
        </h3>
        {!this.props.suppressTopChallenges &&
         <React.Fragment>
           <h4 className="mr-inline-block mr-text-md mr-pb-3 mr-mb-3 mr-border-b mr-border-white-40">
             <FormattedMessage {...messages.userTopChallenges} />
           </h4>
           <ol className="mr-list-reset mr-text-sm mr-links-green-lighter">
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
