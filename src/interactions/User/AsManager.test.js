import AsManager from './AsManager'
import { GUEST_USER_ID } from '../../services/User/User'
import { GroupType, GROUP_TYPE_SUPERUSER }
       from '../../services/Project/GroupType/GroupType'

const superGroup = {id: -1, groupType: GROUP_TYPE_SUPERUSER}
const adminGroup123 = {id: 123, groupType: GroupType.admin}
const readGroup456 = {id: 456, groupType: GroupType.read}
const adminGroup789 = {id: 789, groupType: GroupType.admin}
const writeGroup234 = {id: 234, groupType: GroupType.write}

const powerUser = {id: 246, groups: [adminGroup123, readGroup456]}
const writeUser = {id: 910, groups: [writeGroup234]}
const superUser = {id: 135, groups: [superGroup]}
const normalUser = {id: 790, osmProfile: {id: 987654321}, groups: []}

const project123 = {id: 123, groups: [adminGroup123]}
const project456 = {id: 456, groups: [readGroup456]}
const project789 = {id: 789, groups: [adminGroup789]}
const project101 = {id: 101, groups: [adminGroup789], owner: 987654321}
const project102 = {id: 102, groups: [adminGroup123, writeGroup234, readGroup456]}

const challenge123_1 = {id: 1231, parent: 123}
const challenge123_2 = {id: 1232, parent: 123}
const challenge456_1 = {id: 4561, parent: 456}
const challenge789_1 = {id: 7891, parent: 789}

describe('projectGroupTypes', () => {
  it("returns the project group types possessed by the user", () => {
    const manager = AsManager(powerUser)

    const projectGroups = manager.projectGroupTypes(project102)
    expect(projectGroups).toContain(GroupType.admin)
    expect(projectGroups).toContain(GroupType.read)
    expect(projectGroups).not.toContain(GroupType.write)
  })

  it("includes the superuser group type for superusers", () => {
    const manager = AsManager(superUser)

    const projectGroups = manager.projectGroupTypes(project102)
    expect(projectGroups).toContain(GROUP_TYPE_SUPERUSER)
  })

  it("returns an empty list for a user possessing none of the project's group types", () => {
    const manager = AsManager(powerUser)

    const projectGroups = manager.projectGroupTypes(project789)
    expect(projectGroups).toHaveLength(0)
  })
})

describe('canManage', () => {
  it("always returns true if the user is a superuser", () => {
    const manager = AsManager(superUser)

    expect(manager.canManage(project123)).toBe(true)
    expect(manager.canManage(project456)).toBe(true)
  })

  it("returns true if the user possesses any of the project's groups", () => {
    const manager = AsManager(powerUser)

    expect(manager.canManage(project123)).toBe(true)
    expect(manager.canManage(project456)).toBe(true)
    expect(manager.canManage(project789)).toBe(false)
  })

  it("returns true if the user is the project owner", () => {
    const manager = AsManager(normalUser)

    expect(manager.canManage(project101)).toBe(true)
    expect(manager.canManage(project789)).toBe(false)
  })

  it("returns false if user and project owner ids match but are are undefined", () => {
    const manager = AsManager(powerUser)

    expect(manager.canManage(project789)).toBe(false)
  })

  it("returns false if the user is undefined", () => {
    const missingUser = AsManager(undefined)

    expect(missingUser.canManage(project123)).toBe(false)
  })
})

describe('canAdministrateProject', () => {
  it("always returns true if the user is a superuser", () => {
    const manager = AsManager(superUser)

    expect(manager.canAdministrateProject(project123)).toBe(true)
    expect(manager.canAdministrateProject(project456)).toBe(true)
  })

  it("returns true if the user is the project owner", () => {
    const manager = AsManager(normalUser)

    expect(manager.canAdministrateProject(project101)).toBe(true)
    expect(manager.canAdministrateProject(project789)).toBe(false)
  })

  it("returns false if user and project owner ids match but are are undefined", () => {
    const manager = AsManager(powerUser)

    expect(manager.canAdministrateProject(project789)).toBe(false)
  })

  it("returns true if the user possesses the project's admin group", () => {
    const manager = AsManager(powerUser)

    expect(manager.canAdministrateProject(project123)).toBe(true)
  })

  it("returns false if the user merely contains non-admin project group", () => {
    const manager = AsManager(powerUser)

    expect(manager.canAdministrateProject(project456)).toBe(false)
  })

  it("returns false if the user is undefined", () => {
    const missingUser = AsManager(undefined)

    expect(missingUser.canAdministrateProject(project123)).toBe(false)
  })
})

describe('canReadProject', () => {
  it("always returns true if the user is a superuser", () => {
    const manager = AsManager(superUser)

    expect(manager.canReadProject(project123)).toBe(true)
    expect(manager.canReadProject(project456)).toBe(true)
  })

  it("returns true if the user possesses the project's read group", () => {
    const manager = AsManager(powerUser)

    expect(manager.canReadProject(project456)).toBe(true)
    expect(manager.canReadProject(project789)).toBe(false)
  })

  it("returns true if the user possesses the project's write group", () => {
    const manager = AsManager(writeUser)

    expect(manager.canReadProject(project102)).toBe(true)
  })

  it("returns true if the user possesses the project's admin group", () => {
    const manager = AsManager(powerUser)

    expect(manager.canReadProject(project123)).toBe(true)
  })

  it("returns true if the user is the project owner", () => {
    const manager = AsManager(normalUser)

    expect(manager.canReadProject(project101)).toBe(true)
    expect(manager.canReadProject(project789)).toBe(false)
  })

  it("returns false if user and project owner ids match but are are undefined", () => {
    const manager = AsManager(powerUser)

    expect(manager.canReadProject(project789)).toBe(false)
  })

  it("returns false if the user is undefined", () => {
    const missingUser = AsManager(undefined)

    expect(missingUser.canReadProject(project123)).toBe(false)
  })
})

describe('canWriteProject', () => {
  it("always returns true if the user is a superuser", () => {
    const manager = AsManager(superUser)

    expect(manager.canWriteProject(project123)).toBe(true)
    expect(manager.canWriteProject(project456)).toBe(true)
  })

  it("returns true if the user is the project owner", () => {
    const manager = AsManager(normalUser)

    expect(manager.canWriteProject(project101)).toBe(true)
    expect(manager.canWriteProject(project789)).toBe(false)
  })

  it("returns false if user and project owner ids match but are are undefined", () => {
    const manager = AsManager(powerUser)

    expect(manager.canWriteProject(project789)).toBe(false)
  })

  it("returns true if the user possesses the project's admin group", () => {
    const manager = AsManager(powerUser)

    expect(manager.canWriteProject(project123)).toBe(true)
  })

  it("returns true if the user possesses the project's write group", () => {
    const manager = AsManager(writeUser)

    expect(manager.canWriteProject(project102)).toBe(true)
  })

  it("returns false if the user merely contains the project's read group", () => {
    const manager = AsManager(powerUser)

    expect(manager.canWriteProject(project456)).toBe(false)
  })

  it("returns false if the user is undefined", () => {
    const missingUser = AsManager(undefined)

    expect(missingUser.canWriteProject(project123)).toBe(false)
  })
})

describe('manageableProjects', () => {
  it("returns only those projects the user can manage", () => {
    const manager = AsManager(powerUser)

    const manageable = manager.manageableProjects([project123, project456, project789])
    expect(manageable.length).toBe(2)
    expect(manageable).toContain(project123)
    expect(manageable).toContain(project456)
  })
})

describe('manageableChallenges', () => {
  it("returns only those challenges belonging to projects the user can manage", () => {
    const manager = AsManager(powerUser)

    const manageable = manager.manageableChallenges(
      [project123, project456, project789],
      [challenge123_1, challenge123_2, challenge456_1, challenge789_1])

    expect(manageable.length).toBe(3)
    expect(manageable).toContain(challenge123_1)
    expect(manageable).toContain(challenge123_2)
    expect(manageable).toContain(challenge456_1)
  })
})
