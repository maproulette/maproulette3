import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _isEmpty from 'lodash/isEmpty'
import _values from 'lodash/values'
import _filter from 'lodash/filter'
import { fetchFeaturedChallenges }
       from '../../../services/Challenge/Challenge'
import { fetchFeaturedProjects }
       from '../../../services/Project/Project'
import { isUsableChallengeStatus }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'

/**
 * WithFeatured fetches the current featured challenges and projects from the
 * server on mount and passes them down to the WrappedComponent
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithFeatured = (WrappedComponent, options={}) => {
  return class extends Component {
    state = {
      featuredChallenges: [],
      featuredProjects: [],
    }

    componentDidMount() {
      // Fetch featured challenges
      if (!options.excludeChallenges) {
        this.props.fetchFeaturedChallenges().then(normalizedResults => {
          if (normalizedResults && !_isEmpty(normalizedResults.entities)) {
            this.setState({
              featuredChallenges: _filter(_values(normalizedResults.entities.challenges),
                                          challenge => isUsableChallengeStatus(challenge))

            })
          }
        })
      }

      // Fetch featured projects
      if (!options.excludeProjects) {
        this.props.fetchFeaturedProjects().then(normalizedResults => {
          if (normalizedResults && !_isEmpty(normalizedResults.entities)) {
            this.setState({
              featuredProjects: _values(normalizedResults.entities.projects)
            })
          }
        })
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          featuredChallenges={this.state.featuredChallenges}
          featuredProjects={this.state.featuredProjects}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => bindActionCreators({
  fetchFeaturedChallenges,
  fetchFeaturedProjects,
}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithFeatured(WrappedComponent))
