import { test } from '@playwright/test'
import { registerAuthTests } from './auth.js'
import { registerCreateChallengeTests } from './create-challenge.js'
import { registerCreateProjectTests } from './create-project.js'
import { registerDatabaseSnapshotTest } from './database-snapshot.js'

test.describe('Test Suite Orchestrator', () => {
  test.describe.configure({ mode: 'serial' })

  // Register auth tests - these will run first
  test.describe('Authentication', () => {
    test.describe.configure({ mode: 'serial' })
    registerAuthTests()
  })

  // Register project creation tests - must run before challenge creation
  test.describe('Project Creation', () => {
    test.describe.configure({ mode: 'serial' })
    registerCreateProjectTests()
  })

  // Register challenge creation tests - uses the project created above
  test.describe('Challenge Creation', () => {
    test.describe.configure({ mode: 'serial' })
    registerCreateChallengeTests()
  })

  // Database snapshot comparison must be the last test before teardown
  test.describe('Database Snapshot Verification', () => {
    test.describe.configure({ mode: 'serial' })
    registerDatabaseSnapshotTest()
  })
})
