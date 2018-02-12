import React, { Component } from 'react';
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _findIndex from 'lodash/findIndex'
import _sortBy from 'lodash/sortBy'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'

const FEATURED_POINTS = -1
const SAVED_POINTS = -2

export default function(WrappedComponent,
                        challengesProp='challenges',
                        outputProp) {
  class WithSortedChallenges extends Component {
    render() {
      // Give extra points to featured challenges and -- if we're given a
      // user -- saved challenges
      const savedChallenges = _get(this.props, 'user.savedChallenges', [])

      const sortedChallenges = _sortBy(this.props[challengesProp], challenge => {
        let score = 0
        score += challenge.featured ? FEATURED_POINTS : 0
        score += _findIndex(savedChallenges, {id: challenge.id}) !== -1 ?
                 SAVED_POINTS : 0
        return score
      })
        
      if (_isEmpty(outputProp)) {
        outputProp = challengesProp
      }

      return <WrappedComponent {...{[outputProp]: sortedChallenges}}
                               {..._omit(this.props, outputProp)} />
    }
  }

  WithSortedChallenges.propTypes = {
    user: PropTypes.object,
    challenges: PropTypes.array,
  }

  return WithSortedChallenges
}
