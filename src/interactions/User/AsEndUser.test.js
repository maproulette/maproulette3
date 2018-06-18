import AsEndUser from './AsEndUser'
import { GUEST_USER_ID } from '../../services/User/User'
import { GROUP_TYPE_SUPERUSER }
       from '../../services/Project/GroupType/GroupType'

const superGroup = {id: -1, groupType: GROUP_TYPE_SUPERUSER}

const guestUser = {id: GUEST_USER_ID, groups: []}
const simpleUser = {id: 357, groups: []}
const superUser = {id: 135, groups: [superGroup]}

describe('isLoggedIn', () => {
  it("returns false if there is no user object", () => {
    const endUser = AsEndUser(undefined)
    expect(endUser.isLoggedIn()).toBe(false)
  })

  it("returns false if the user object does not have an id", () => {
    const endUser = AsEndUser({})
    expect(endUser.isLoggedIn()).toBe(false)
  })

  it("returns false if the user is a guest user", () => {
    const endUser = AsEndUser(guestUser)
    expect(endUser.isLoggedIn()).toBe(false)
  })

  it("returns true if the user is not a guest user", () => {
    const endUser = AsEndUser(simpleUser)
    expect(endUser.isLoggedIn()).toBe(true)
  })
})

describe('isSuperUser', () => {
  it("returns false if there is no user object", () => {
    const endUser = AsEndUser(undefined)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns false if the user is a guest user", () => {
    const endUser = AsEndUser(guestUser)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns false if the user is a a normal end user", () => {
    const endUser = AsEndUser(simpleUser)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns true if the user is a super user", () => {
    const endUser = AsEndUser(superUser)
    expect(endUser.isSuperUser()).toBe(true)
  })
})
