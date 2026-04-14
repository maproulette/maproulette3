import { test } from '@playwright/test'
import { registerAuthTests } from './auth.js'
import { registerCreateChallengeTests } from './create-challenge.js'
import { registerCreateProjectTests } from './create-project.js'
import { registerDatabaseSnapshotTest } from './database-snapshot.js'

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

  test.describe('Database Snapshot Verification', () => {
    test.describe.configure({ mode: 'serial' })
    registerDatabaseSnapshotTest()
  })
})
