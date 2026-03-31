import { expect, test } from '@playwright/test'
import { compareSnapshots, createDatabaseSnapshot } from '../utils/database.js'

// Export function to register database snapshot test - this must run last before teardown
export const registerDatabaseSnapshotTest = () => {
  test('should match expected database state', async () => {
    const snapshotName = `previousTestDataOutput.json`
    createDatabaseSnapshot(snapshotName)

    const initialSnapshot = 'expectedTestDataOutput.json'
    const comparisonPassed = compareSnapshots(initialSnapshot, snapshotName)

    if (!comparisonPassed) {
      console.error(
        '❌ Database state changed during tests. Expected exact match but snapshots differ.'
      )
    }

    expect(comparisonPassed).toBe(true)
  })
}
