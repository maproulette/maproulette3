import { Fragment, Component } from 'react'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import Hero from './Hero'
import Intro from './Intro'
import Instructions from './Instructions'
import Featured from './Featured'

export class Home extends Component {
  render() {
    return (
      <Fragment>
        <Hero {...this.props} />
        <Intro {...this.props} />
        <Instructions {...this.props} />
        <Featured {...this.props} />
      </Fragment>
    );
  }
}

export default WithCurrentUser(Home)
