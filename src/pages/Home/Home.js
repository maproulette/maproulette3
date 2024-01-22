import React, { Component } from 'react'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import Hero from './Hero'
import Intro from './Intro'
import Instructions from './Instructions'
import Featured from './Featured'
import MetaDecorator from '../../utils/metaDecorator'
import Image from '../../static/images/bg-map@2x.jpg'

export class Home extends Component {
  render() {
    return (
      <div>
        <MetaDecorator
          description={"Test Data"}
          title={"Test Data"}
          imageUrl={Image}
          imageAlt={"image not found test data"}
        />  
        <React.Fragment>
          <Hero {...this.props} />
          <Intro {...this.props} />
          <Instructions {...this.props} />
          <Featured {...this.props} />
        </React.Fragment>
      </div>
    )
  }
}

export default WithCurrentUser(Home)
