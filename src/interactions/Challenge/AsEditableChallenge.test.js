import AsEditableChallenge from './AsEditableChallenge'

let challenge = null

beforeEach(() => {
  challenge = {
    id: 123,
  }
})

describe("isNew", () => {
  test("returns true if the challenge does not have an id", () => {
    delete challenge.id

    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.isNew()).toBe(true)
  })
  
  test("returns false if the challenge has an id", () => {
    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.isNew()).toBe(false)
  })
})

describe("hasZeroTasks", () => {
  test("returns false if the challenge actions total is non-zero", () => {
    challenge.actions = {total: 1}

    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.hasZeroTasks()).toBe(false)
  })

  test("returns true if the challenge actions total equals zero", () => {
    challenge.actions = {total: 0}

    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.hasZeroTasks()).toBe(true)
  })

  test("returns true if there are no actions", () => {
    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.hasZeroTasks()).toBe(true)
  })
})

describe("isSourceReadOnly", () => {
  test("returns false if the challenge is new", () => {
    delete challenge.id

    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.isSourceReadOnly()).toBe(false)
  })

  test("returns true for an existing challenge with actions total of at least 1", () => {
    challenge.actions = {total: 1}
    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.isSourceReadOnly()).toBe(true)
  })

  test("returns false for an existing challenge with actions total of 0", () => {
    challenge.actions = {total: 0}
    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.isSourceReadOnly()).toBe(false)
  })

  test("returns false if there are no actions", () => {
    const wrappedChallenge = AsEditableChallenge(challenge)
    expect(wrappedChallenge.isSourceReadOnly()).toBe(false)
  })
})

describe("appendHashtagToCheckinComment", () => {
  test("Sets an empty checkin comment to the hashtag", () => {
    const wrappedChallenge = AsEditableChallenge(challenge)

    wrappedChallenge.appendHashtagToCheckinComment()
    expect(wrappedChallenge.checkinComment).toEqual("#maproulette")
  })

  test("Appends the hashtag to an existing comment", () => {
    challenge.checkinComment = "My Comment"
    const wrappedChallenge = AsEditableChallenge(challenge)

    wrappedChallenge.appendHashtagToCheckinComment()
    expect(wrappedChallenge.checkinComment).toEqual("My Comment #maproulette")
  })

  test("Doesn't duplicate an existing hashtag in the comment", () => {
    challenge.checkinComment = "My #maproulette Comment"
    const wrappedChallenge = AsEditableChallenge(challenge)

    wrappedChallenge.appendHashtagToCheckinComment()
    expect(wrappedChallenge.checkinComment).toEqual("My #maproulette Comment")
  })
})
