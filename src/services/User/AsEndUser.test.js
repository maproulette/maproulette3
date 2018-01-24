import AsEndUser from './AsEndUser'
import { GUEST_USER_ID,
         SUPERUSER_GROUP_TYPE,
         ADMIN_GROUP_TYPE } from './User'

const superGroup = {id: -1, groupType: SUPERUSER_GROUP_TYPE}

const guestUser = {id: GUEST_USER_ID, groups: []}
const simpleUser = {id: 357, groups: []}
const superUser = {id: 135, groups: [superGroup]}

describe('isLoggedIn', () => {
  it("returns false if there is no user object", () => {
    const endUser = new AsEndUser(undefined)
    expect(endUser.isLoggedIn()).toBe(false)
  })

  it("returns false if the user object does not have an id", () => {
    const endUser = new AsEndUser({})
    expect(endUser.isLoggedIn()).toBe(false)
  })

  it("returns false if the user is a guest user", () => {
    const endUser = new AsEndUser(guestUser)
    expect(endUser.isLoggedIn()).toBe(false)
  })

  it("returns true if the user is not a guest user", () => {
    const endUser = new AsEndUser(simpleUser)
    expect(endUser.isLoggedIn()).toBe(true)
  })
})

describe('isSuperUser', () => {
  it("returns false if there is no user object", () => {
    const endUser = new AsEndUser(undefined)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns false if the user is a guest user", () => {
    const endUser = new AsEndUser(guestUser)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns false if the user is a a normal end user", () => {
    const endUser = new AsEndUser(simpleUser)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns true if the user is a super user", () => {
    const endUser = new AsEndUser(superUser)
    expect(endUser.isSuperUser()).toBe(true)
  })
})
