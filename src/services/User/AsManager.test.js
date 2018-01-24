import AsManager from './AsManager'
import { GUEST_USER_ID,
         SUPERUSER_GROUP_TYPE,
         ADMIN_GROUP_TYPE } from './User'

const superGroup = {id: -1, groupType: SUPERUSER_GROUP_TYPE}
const group123 = {id: 123, groupType: ADMIN_GROUP_TYPE}
const group456 = {id: 456, groupType: ADMIN_GROUP_TYPE}
const group789 = {id: 789, groupType: ADMIN_GROUP_TYPE}

const powerUser = {id: 246, groups: [group123, group456]}
const superUser = {id: 135, groups: [superGroup]}

const project123 = {id: 123, groups: [group123]}
const project456 = {id: 456, groups: [group456]}
const project789 = {id: 789, groups: [group789]}

const challenge123_1 = {id: 1231, parent: 123}
const challenge123_2 = {id: 1232, parent: 123}
const challenge456_1 = {id: 4561, parent: 456}
const challenge789_1 = {id: 7891, parent: 789}


describe('canManage', () => {
  it("always returns true if the user is a superuser", () => {
    const manager = new AsManager(superUser)

    expect(manager.canManage(project123)).toBe(true)
    expect(manager.canManage(project456)).toBe(true)
  })

  it("returns true only if the user contains the project's group", () => {
    const manager = new AsManager(powerUser)

    expect(manager.canManage(project123)).toBe(true)
    expect(manager.canManage(project789)).toBe(false)
  })

  it("returns false if the user is undefined", () => {
    const missingUser = new AsManager(undefined)

    expect(missingUser.canManage(project123)).toBe(false)
  })
})

describe('manageableProjects', () => {
  it("returns only those projects the user can manage", () => {
    const manager = new AsManager(powerUser)

    const manageable = manager.manageableProjects([project123, project456, project789])
    expect(manageable.length).toBe(2)
    expect(manageable).toContain(project123)
    expect(manageable).toContain(project456)
  })
})

describe('manageableChallenges', () => {
  it("returns only those challenges belonging to projects the user can manage", () => {
    const manager = new AsManager(powerUser)

    const manageable = manager.manageableChallenges(
      [project123, project456, project789],
      [challenge123_1, challenge123_2, challenge456_1, challenge789_1])

    expect(manageable.length).toBe(3)
    expect(manageable).toContain(challenge123_1)
    expect(manageable).toContain(challenge123_2)
    expect(manageable).toContain(challenge456_1)
  })
})
