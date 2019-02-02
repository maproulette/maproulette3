import React, { Component } from 'react'
import { injectIntl } from 'react-intl'

import _get from 'lodash/get'

import Leaderboard from '../Leaderboard/Leaderboard'
import messages from './Messages'

export class CountryLeaderboard extends Component {
  render() {
    const countryCode = _get(this.props, 'match.params.countryCode')
    const displayName = this.props.intl.formatMessage(messages[countryCode]) || countryCode

    return <Leaderboard leaderboardOptions={{onlyEnabled: true, filterCountry: true}}
                        countryCode={countryCode}
                        displayName={displayName}
                        {...this.props} />
  }
}

export default injectIntl(CountryLeaderboard)
