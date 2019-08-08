import { constructChallengeComment } from './Challenge'

describe('constructChallengeComment', () => {
  test("it appends the challenge URL", () => {
    const challenge = {
      id: 123,
      checkinComment: "Foo",
      includeCheckinURL: true,
    }
    expect(constructChallengeComment(challenge)).toEqual("Foo http://127.0.0.1:3000/browse/challenges/123")
  })

  test("it does nothing when the include flag is false", () => {
    const challenge = {
      id: 123,
      checkinComment: "Foo",
      includeCheckinURL: false,
    }
    expect(constructChallengeComment(challenge)).toEqual("Foo")
  })

  test("it doesn't append an URL if it looks like there's already an URL in the comment", () => {
    const challenge = {
      id: 123,
      checkinComment: "The URL http://127.0.0.1:3000 is already here",
      includeCheckinURL: true,
    }
    expect(constructChallengeComment(challenge)).toEqual("The URL http://127.0.0.1:3000 is already here")
  })

  test("it doesn't append an URL if the resulting comment would be >255 chars in length", () => {
    const challenge = {
      id: 123,
      checkinComment: "X".repeat(250),
      includeCheckinURL: true,
    }
    expect(constructChallengeComment(challenge)).toEqual("X".repeat(250))
  })
})
