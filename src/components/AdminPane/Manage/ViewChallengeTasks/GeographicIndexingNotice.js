import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import differenceInHours from 'date-fns/difference_in_hours'
import _get from 'lodash/get'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import messages from './Messages'

/**
 * GeographicIndexingNotice display a notice to the challenge owner letting
 * them know that it could take time before their new or modified challenge
 * shows up as expected in location-specific browsing or searching.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class GeographicIndexingNotice extends Component {
  render() {
    const reindexingDelay =
      _get(process.env, 'REACT_APP_GEOGRAPHIC_INDEXING_DELAY', 0)

    // If enough time has passed, nothing to show
    if (differenceInHours(Date.now(), _get(this.props, 'challenge.lastTaskRefresh', 0)) >
        reindexingDelay) {
      return null
    }

    return (
      <div className="admin__manage__challenge-dashboard__indexing-notice notification">
        <SvgSymbol sym='hourglass-icon' className='icon' viewBox='0 0 20 20' />
        <FormattedMessage {...messages.geographicIndexingNotice}
                          values={{delay: reindexingDelay}} />
      </div>
    )
  }
}

GeographicIndexingNotice.propTypes = {
  challenge: PropTypes.object,
}
