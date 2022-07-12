import {
  fetchLeaderboard, 
  initializeLeaderboardParams, 
  fetchReviewerLeaderboard, 
  fetchLeaderboardForUser
} from "./Leaderboard";

describe("fetchLeaderboard", () => {
  test("returns empty object if no params provided", () => {
    const leaderboard = fetchLeaderboard()
    expect(Object.keys(leaderboard).length).toBe(0)
  })
})

describe("fetchLeaderboardForUser", () => {
  test("returns empty object if no params provided", () => {
    const leaderboard = fetchLeaderboardForUser()
    expect(Object.keys(leaderboard).length).toBe(0)
  })
})

describe("fetchReviewerLeaderboard", () => {
  test("returns empty object if no params provided", () => {
    const leaderboard = fetchReviewerLeaderboard()
    expect(Object.keys(leaderboard).length).toBe(0)
  })
})

describe("initializeLeaderboardParams", () => {
  test("correctly sets params in params object", () => {
    const params = {};
    initializeLeaderboardParams(params, 1, [10,11], [10,11], [1,2], ['DZ', 'UK'])

    expect(params.monthDuration).toBe(1);
    expect(params.countryCodes).toBe("DZ,UK");
    expect(params.userIds).toBe("1,2");
    expect(params.challengeIds).toBe("10,11");
    expect(params.projectIds).toBe("10,11");
  })

  test("returns correctly formatted start and end date if providing custom month range", () => {
    const params = {};
    initializeLeaderboardParams(params, -2, null, null, null, null, 1657653373473, 1657663373473)

    expect(params.start).toBe("2022-07-12T19:16:13.473Z");
    expect(params.end).toBe("2022-07-12T22:02:53.473Z");
  })

  test("returns correctly formatted start and end date if providing current month range", () => {
    const params = {};
    initializeLeaderboardParams(params, 0)

    expect(typeof params.start).toBe("string");
    expect(typeof params.end).toBe("string");
  })
})
