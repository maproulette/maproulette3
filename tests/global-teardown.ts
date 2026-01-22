import { createDatabaseSnapshot, compareSnapshots, stopDatabase } from './utils/database.js'
import { stopBackend } from './utils/backend.js'

export default async function globalTeardown() {
  console.log('Running global teardown...')

  try {
    // Create final snapshot
    const snapshotName = `snapshot-after.json`
    createDatabaseSnapshot(snapshotName)

    // Compare with initial snapshot if it exists
    const initialSnapshot = 'snapshot-expected.json'
    const comparisonPassed = compareSnapshots(initialSnapshot, snapshotName)

    if (!comparisonPassed) {
      console.warn(
        '⚠️  Database state changed during tests. This may be expected if tests modify data.',
      )
    }
  } catch (error) {
    console.error('Error during snapshot creation:', error)
    // Don't fail the test run if snapshot fails
  }

  // Stop backend
  stopBackend()

  // Stop database (optional - you might want to keep it running for debugging)
  if (process.env.KEEP_TEST_DB !== 'true') {
    stopDatabase()
  } else {
    console.log('Keeping test database running (KEEP_TEST_DB=true)')
  }

  console.log('✓ Global teardown complete')
}

