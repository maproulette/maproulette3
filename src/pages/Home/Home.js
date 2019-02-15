import React, { Component } from 'react'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import Hero from './Hero'
import Highlights from './Highlights'
import Intro from './Intro'
import Instructions from './Instructions'
import FeaturedChallenges from './FeaturedChallenges'

export class Home extends Component {
  render() {
    return (
      <React.Fragment>
        <Hero {...this.props} />
        <Highlights {...this.props} />
        <Intro {...this.props} />
        <Instructions {...this.props} />
        <FeaturedChallenges {...this.props} />
      </React.Fragment>
    )
  }
}

export default WithCurrentUser(Home)
