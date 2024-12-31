import { shallow } from "enzyme";
import CardLeaderboard from "./CardLeaderboard";
import RowLeaderboard from "./RowLeaderboard";

describe("hoverUser", () => {
  let wrapper;

  beforeEach(() => {
    const user = {
      id: 123,
      name: "test",
      topChallenges: [],
      rank: 1,
      score: 3,
    };
    wrapper = shallow(<CardLeaderboard leader={user} />);
  });

  test("isHover is false on load", () => {
    expect(wrapper.state().isHover).toEqual(false);
  });

  test("isHover is true on hover & false on leave", () => {
    wrapper.instance().onHover();
    expect(wrapper.state().isHover).toEqual(true);

    wrapper.instance().onLeave();
    expect(wrapper.state().isHover).toEqual(false);
  });
});

describe("hoverUser", () => {
  let wrapper;

  beforeEach(() => {
    const user = {
      id: 123,
      name: "test",
      topChallenges: [],
      rank: 1,
      score: 3,
    };
    wrapper = shallow(<RowLeaderboard leader={user} />);
  });

  test("isHover is false on load", () => {
    expect(wrapper.state().isHover).toEqual(false);
  });

  test("isHover is true on hover & false on leave", () => {
    wrapper.instance().onHover();
    expect(wrapper.state().isHover).toEqual(true);

    wrapper.instance().onLeave();
    expect(wrapper.state().isHover).toEqual(false);
  });
});
