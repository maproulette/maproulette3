import { Component, Fragment } from "react";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import Featured from "./Featured";
import Hero from "./Hero";
import Instructions from "./Instructions";
import Intro from "./Intro";

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

export default WithCurrentUser(Home);
