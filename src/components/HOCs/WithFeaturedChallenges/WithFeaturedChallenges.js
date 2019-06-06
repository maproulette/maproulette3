import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _isEmpty from 'lodash/isEmpty'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import { fetchFeaturedChallenges }
       from '../../../services/Challenge/Challenge'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'

/**
 * WithFeaturedChallenges fetches the current featured challenges from the
 * server on mount and passes them down to the WrappedComponent
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithFeaturedChallenges = WrappedComponent => {
  return class extends Component {
    state = {
      featuredChallenges: [],
    }

    async componentDidMount() {
      const normalizedResults = await this.props.fetchFeaturedChallenges()
      if (normalizedResults && !_isEmpty(normalizedResults.entities)) {
        this.setState({
          featuredChallenges: _filter(_values(normalizedResults.entities.challenges),
                                      challenge => isUsableChallengeStatus(challenge))

        })
      }
    }

    render() {
      return <WrappedComponent featuredChallenges={this.state.featuredChallenges}
                              {...this.props} />
    }
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return bindActionCreators({ fetchFeaturedChallenges }, dispatch)
}

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithFeaturedChallenges(WrappedComponent))
