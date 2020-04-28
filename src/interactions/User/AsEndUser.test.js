import AsEndUser from './AsEndUser'
import { GUEST_USER_ID } from '../../services/User/User'
import { ROLE_SUPERUSER } from '../../services/Grant/Role'

const superUserGrant = {id: -1, role: ROLE_SUPERUSER}

const guestUser = {id: GUEST_USER_ID, grants: []}
const simpleUser = {id: 357, grants: []}
const superUser = {id: 135, grants: [superUserGrant]}

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

  it("returns false if the user is a normal end user", () => {
    const endUser = AsEndUser(simpleUser)
    expect(endUser.isSuperUser()).toBe(false)
  })

  it("returns true if the user is a super user", () => {
    const endUser = AsEndUser(superUser)
    expect(endUser.isSuperUser()).toBe(true)
  })
})
