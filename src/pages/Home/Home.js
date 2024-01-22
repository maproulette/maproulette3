import React, { Component } from 'react'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import Hero from './Hero'
import Intro from './Intro'
import Instructions from './Instructions'
import Featured from './Featured'
import MetaDecorator from '../../utils/metaDecorator'
import Image from '../../../public/assets/images/favicons/android-chrome-512x512.png'

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
