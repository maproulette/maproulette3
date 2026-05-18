import { test } from '@playwright/test'
import { registerAuthTests } from './auth.js'
import { registerCreateChallengeTests } from './create-challenge.js'
import { registerCreateProjectTests } from './create-project.js'
import { registerDatabaseSnapshotTest } from './database-snapshot.js'
import { registerMapperBrowseChallengeTests } from './mapper-browse-challenge.js'
import { registerMapperExploreTests } from './mapper-explore.js'
import { registerMapperTaskFlowTests } from './mapper-task-flow.js'

test.describe('Test Suite Orchestrator', () => {
  test.describe.configure({ mode: 'serial' })

  test.describe('Authentication', () => {
    test.describe.configure({ mode: 'serial' })
    registerAuthTests()
  })

  test.describe('Project Creation', () => {
    test.describe.configure({ mode: 'serial' })
    registerCreateProjectTests()
  })

  test.describe('Challenge Creation', () => {
    test.describe.configure({ mode: 'serial' })
    registerCreateChallengeTests()
  })

  test.describe('Mapper Flow — Explore Challenges', () => {
    test.describe.configure({ mode: 'serial' })
    registerMapperExploreTests()
  })

  test.describe('Mapper Flow — Browse Challenge', () => {
    test.describe.configure({ mode: 'serial' })
    registerMapperBrowseChallengeTests()
  })

  test.describe('Mapper Flow — Task Submission & Bundling', () => {
    test.describe.configure({ mode: 'serial' })
    registerMapperTaskFlowTests()
  })

  test.describe('Database Snapshot Verification', () => {
    test.describe.configure({ mode: 'serial' })
    registerDatabaseSnapshotTest()
  })
})
