import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _isFinite from 'lodash/isFinite'
import { Link } from 'react-router-dom'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

export default class SavedChallenges extends Component {
  render() {
    const challengeItems =
      _compact(_map(_get(this.props, 'user.savedChallenges', []), challenge => {
        if (!_isFinite(_get(challenge, 'id'))) {
          return null
        }

        return (
          <li key={challenge.id} className="columns saved-challenges__challenge">
            <Link to={`/browse/challenges/${challenge.id}`}>
              {challenge.name}
            </Link>

            <span className="connector" />

            <a className='button is-clear'
              onClick={() => this.props.unsaveChallenge(this.props.user.id, challenge.id)}
              title={this.props.intl.formatMessage(messages.unsave)}>
              <SvgSymbol className='icon' sym='trash-icon' viewBox='0 0 20 20' />
            </a>
          </li>
        )
      }
    ))

    const savedChallenges = challengeItems.length > 0 ?
                            <ul>{challengeItems}</ul> :
                            <div className="none">No Challenges</div>

    return (
      <div className={classNames("saved-challenges", this.props.className)}>
        <h2 className="subtitle">
          <FormattedMessage {...messages.header} />
        </h2>

        {savedChallenges}
      </div>
    )
  }
}

SavedChallenges.propTypes = {
  user: PropTypes.object.isRequired,
}
