import { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { differenceInHours } from 'date-fns'
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
      _get(import.meta.env, 'REACT_APP_GEOGRAPHIC_INDEXING_DELAY', 0)

    // If enough time has passed, nothing to show
    if (differenceInHours(Date.now(), _get(this.props, 'challenge.lastTaskRefresh', 0)) >
        reindexingDelay) {
      return null
    }

    return (
      <div className="mr-flex mr-items-center mr-text-mango mr-text-base mr-mb-8">
        <SvgSymbol
          sym="hourglass-icon"
          className="mr-fill-mango mr-w-16 mr-h-16 mr-mr-4"
          viewBox="0 0 20 20"
        />
        <FormattedMessage
          {...messages.geographicIndexingNotice}
          values={{delay: reindexingDelay}}
        />
      </div>
    )
  }
}

GeographicIndexingNotice.propTypes = {
  challenge: PropTypes.object,
}
