import { test } from '@playwright/test'
import { registerAuthTests } from './auth.js'
import { registerDatabaseSnapshotTest } from './database-snapshot.js'

test.describe('Test Suite Orchestrator', () => {
  test.describe.configure({ mode: 'serial' })

  // Register auth tests - these will run first
  test.describe('Authentication', () => {
    test.describe.configure({ mode: 'serial' })
    registerAuthTests()
  })

  // Database snapshot comparison must be the last test before teardown
  test.describe('Database Snapshot Verification', () => {
    test.describe.configure({ mode: 'serial' })
    registerDatabaseSnapshotTest()
  })
})
