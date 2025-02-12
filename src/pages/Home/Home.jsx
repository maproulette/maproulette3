import { memo } from "react";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import Featured from "./Featured";
import Hero from "./Hero";
import Instructions from "./Instructions";
import Intro from "./Intro";

const Home = memo(function Home(props) {
  return (
    <>
      <Hero {...props} />
      <Intro {...props} />
      <Instructions {...props} />
      <Featured {...props} />
    </>
  );
});

export default WithCurrentUser(Home);
