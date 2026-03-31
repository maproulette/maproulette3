import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DOCKER_COMPOSE_FILE = join(process.cwd(), 'docker-compose.test.yml')
const CONTAINER_NAME = 'maproulette-postgis-test'
const DB_NAME = 'mr_test'
const DB_USER = 'mr_test_user'
const DB_PASSWORD = 'mr_test_password'
const DB_HOST = 'localhost'
const DB_PORT = '5433'

let cachedDockerComposeCommand: string | null = null

/**
 * Get the docker compose command to use.
 * Tries 'docker compose' (plugin) first, falls back to 'docker-compose' (standalone).
 * Caches the result to avoid repeated checks.
 */
function getDockerComposeCommand(): string {
  if (cachedDockerComposeCommand !== null) {
    return cachedDockerComposeCommand
  }

  try {
    // Try 'docker compose' first (modern Docker plugin, used in GitHub Actions)
    execSync('docker compose version', { stdio: 'ignore' })
    cachedDockerComposeCommand = 'docker compose'
  } catch {
    // Fall back to 'docker-compose' (standalone tool)
    cachedDockerComposeCommand = 'docker-compose'
  }

  return cachedDockerComposeCommand
}

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
  }
}

export function getDatabaseUrl(): string {
  const config = getDatabaseConfig()
  return `jdbc:postgresql://${config.host}:${config.port}/${config.database}`
}

export async function startDatabase(): Promise<void> {
  // Check if we're running in CI (GitHub Actions provides database as a service)
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

  if (isCI) {
    // Wait for database to be ready (using pg_isready directly, not docker exec)

    let retries = 30
    let _attempt = 0
    while (retries > 0) {
      _attempt++

      try {
        execSync(`pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}`, {
          stdio: 'ignore',
          env: { ...process.env, PGPASSWORD: DB_PASSWORD },
        })

        break
      } catch (_error) {
        retries--
        if (retries === 0) {
          console.error('[DATABASE] ✗ Database failed to become ready within timeout')
          throw new Error('Database failed to become ready within timeout')
        }

        // Wait 1 second before retrying
        await new Promise<void>((resolve) => setTimeout(resolve, 1000))
      }
    }

    return
  }

  try {
    // Stop and remove existing container if it exists
    try {
      execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'pipe' })
      execSync(`docker rm ${CONTAINER_NAME}`, { stdio: 'pipe' })
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 1) {
        // Container doesn't exist, that's fine
      } else {
        // Other error, log it but continue
        console.warn('[DATABASE] Warning while cleaning up existing container:', error)
      }
    }

    // Start the database container using docker-compose
    const dockerComposeCmd = getDockerComposeCommand()
    console.log('[DATABASE] Starting database container...')
    execSync(`${dockerComposeCmd} -f ${DOCKER_COMPOSE_FILE} up -d`, {
      stdio: 'inherit',
    })

    // Wait for database to be ready
    console.log('[DATABASE] Waiting for database to be ready...')
    let retries = 30
    let _attempt = 0
    while (retries > 0) {
      _attempt++

      try {
        execSync(`docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} -d ${DB_NAME}`, {
          stdio: 'ignore',
        })

        console.log('[DATABASE] ✓ Database is ready')
        break
      } catch (_error) {
        retries--
        if (retries === 0) {
          console.error('[DATABASE] ✗ Database failed to start within timeout')
          throw new Error('Database failed to start within timeout')
        }

        // Wait 1 second before retrying
        await new Promise<void>((resolve) => setTimeout(resolve, 1000))
      }
    }
  } catch (error) {
    console.error('[DATABASE] ✗ Failed to start database:', error)
    throw error
  }
}

export function stopDatabase(): void {
  // Check if we're running in CI (GitHub Actions manages the database service)
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

  if (isCI) {
    return
  }

  try {
    const dockerComposeCmd = getDockerComposeCommand()
    execSync(`${dockerComposeCmd} -f ${DOCKER_COMPOSE_FILE} down`, {
      stdio: 'inherit',
    })
  } catch (error) {
    console.error('Failed to stop database:', error)
    // Don't throw - cleanup should be best effort
  }
}

export function createDatabaseSnapshot(outputPath: string): void {
  try {
    const snapshotDir = join(process.cwd(), 'playwright', 'snapshots')
    if (!existsSync(snapshotDir)) {
      mkdirSync(snapshotDir, { recursive: true })
    }

    const snapshotFile = join(snapshotDir, outputPath)

    // Check if we're running in CI (use psql directly instead of docker exec)
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

    // Check if container exists (for local development)
    if (!isCI) {
      try {
        const containerCheck = execSync(
          `docker ps -a --filter name=${CONTAINER_NAME} --format "{{.Names}}"`,
          { encoding: 'utf-8', stdio: 'pipe' }
        )
        if (!containerCheck.trim()) {
          console.warn('[DATABASE] Container does not exist, skipping snapshot creation')
          return
        }
      } catch {
        console.warn('[DATABASE] Could not check container status, skipping snapshot creation')
        return
      }
    }

    const psqlEnv = { ...process.env, PGPASSWORD: DB_PASSWORD }
    const psqlCmd = isCI
      ? `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}`
      : `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}`

    // Get list of all tables
    const tablesOutput = execSync(
      `${psqlCmd} -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"`,
      { encoding: 'utf-8', env: isCI ? psqlEnv : process.env }
    )

    const tables = tablesOutput
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    // Skip large system tables that aren't relevant for test snapshots
    const systemTablesToSkip = ['spatial_ref_sys', 'geometry_columns', 'geography_columns']
    const filteredTables = tables.filter((t) => !systemTablesToSkip.includes(t))

    type TableSnapshot = { rowCount: number; data: Record<string, unknown>[] } | { error: string }
    type DatabaseSnapshot = {
      timestamp: string
      tables: Record<string, TableSnapshot>
    }

    const snapshot: DatabaseSnapshot = {
      timestamp: new Date().toISOString(),
      tables: {},
    }

    // Export data from each table
    for (const table of filteredTables) {
      try {
        // Get column names for this table
        const columnsOutput = execSync(
          `${psqlCmd} -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='${table}' AND table_schema='public' ORDER BY ordinal_position;"`,
          { encoding: 'utf-8', env: isCI ? psqlEnv : process.env }
        )

        const columns = columnsOutput
          .split('\n')
          .map((c) => c.trim())
          .filter((c) => c.length > 0)

        if (columns.length === 0) {
          snapshot.tables[table] = {
            rowCount: 0,
            data: [],
          }
          continue
        }

        // Check if table has an 'id' column, otherwise just select all
        let orderByClause = ''
        if (columns.includes('id')) {
          orderByClause = ' ORDER BY id'
        }

        // Get data as JSON to preserve types and handle nulls properly
        const dataOutput = execSync(
          `${psqlCmd} -t -c "SELECT json_agg(row_to_json(t)) FROM (SELECT * FROM ${table}${orderByClause}) t;"`,
          { encoding: 'utf-8', env: isCI ? psqlEnv : process.env }
        )

        // Also get row count
        const countOutput = execSync(`${psqlCmd} -t -c "SELECT COUNT(*) FROM ${table};"`, {
          encoding: 'utf-8',
          env: isCI ? psqlEnv : process.env,
        })

        let data: Record<string, unknown>[] = []
        const dataJson = dataOutput.trim()
        if (dataJson && dataJson !== 'null' && dataJson !== '') {
          try {
            const parsed = JSON.parse(dataJson)
            // json_agg returns null for empty tables, so handle that
            data = parsed === null ? [] : parsed
          } catch (parseError) {
            console.warn(`Failed to parse JSON for table ${table}:`, parseError)
            data = []
          }
        }

        snapshot.tables[table] = {
          rowCount: parseInt(countOutput.trim(), 10),
          data,
        }
      } catch (error) {
        console.warn(`Failed to snapshot table ${table}:`, error)
        snapshot.tables[table] = { error: String(error) }
      }
    }

    // Normalize date/time values in the entire snapshot before saving
    const normalizedSnapshot = normalizeSnapshotData(snapshot) as DatabaseSnapshot

    writeFileSync(snapshotFile, JSON.stringify(normalizedSnapshot, null, 2))
  } catch (error) {
    console.error('Failed to create database snapshot:', error)
    throw error
  }
}

/**
 * Normalizes date/time strings in snapshot data for comparison.
 * Replaces:
 * - ISO timestamps (2026-01-22T19:09:32.214Z) with "timestamp"
 * - PostgreSQL timestamps (2026-01-22 13:15:41.045) with "timestamp"
 * - Unix timestamps (1769088591) with "timestamp"
 * - Dates (2026-01-22) with "date"
 * - Times (13:09:03.026) with "time"
 */
function normalizeSnapshotData(data: unknown): unknown {
  if (typeof data === 'number') {
    // Check if number is a Unix timestamp
    // Unix seconds: 10 digits, typically 1000000000+ (year 2001+)
    // Unix milliseconds: 13 digits, typically 1000000000000+ (year 2001+)
    if ((data >= 1000000000 && data < 10000000000) || data >= 1000000000000) {
      return 'timestamp'
    }
    return data
  }

  if (typeof data === 'string') {
    // Replace ISO timestamps: 2026-01-22T19:09:32.214Z
    let normalized = data.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/g, 'timestamp')
    // Replace PostgreSQL timestamps: 2026-01-22 13:15:41.045
    normalized = normalized.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?/g, 'timestamp')
    // Replace Unix timestamps: 10 digits (seconds) or 13 digits (milliseconds)
    // Match numbers that are likely Unix timestamps (>= 1000000000 for seconds, >= 1000000000000 for milliseconds)
    normalized = normalized.replace(/\b(\d{10})\b/g, (match, numStr) => {
      const num = parseInt(numStr, 10)
      // Unix seconds: 10 digits, typically 1000000000+ (year 2001+)
      if (num >= 1000000000) {
        return 'timestamp'
      }
      return match
    })
    normalized = normalized.replace(/\b(\d{13})\b/g, (match, numStr) => {
      const num = parseInt(numStr, 10)
      // Unix milliseconds: 13 digits, typically 1000000000000+ (year 2001+)
      if (num >= 1000000000000) {
        return 'timestamp'
      }
      return match
    })
    // Replace dates: 2026-01-22
    normalized = normalized.replace(/\d{4}-\d{2}-\d{2}/g, 'date')
    // Replace times: 13:09:03.026
    normalized = normalized.replace(/\d{2}:\d{2}:\d{2}(\.\d+)?/g, 'time')
    return normalized
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalizeSnapshotData(item))
  }

  if (data !== null && typeof data === 'object') {
    const normalized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = normalizeSnapshotData(value)
    }
    return normalized
  }

  return data
}

export function compareSnapshots(beforePath: string, afterPath: string): boolean {
  try {
    const snapshotDir = join(process.cwd(), 'playwright', 'snapshots')
    const beforeFile = join(snapshotDir, beforePath)
    const afterFile = join(snapshotDir, afterPath)

    if (!existsSync(beforeFile) || !existsSync(afterFile)) {
      console.warn('Snapshot files not found, skipping comparison')
      return true
    }

    const before = JSON.parse(readFileSync(beforeFile, 'utf-8'))
    const after = JSON.parse(readFileSync(afterFile, 'utf-8'))

    // Compare everything except the top-level timestamp (which is snapshot metadata)
    // Create copies without timestamp for comparison
    const beforeForComparison = { ...before }
    const afterForComparison = { ...after }
    delete beforeForComparison.timestamp
    delete afterForComparison.timestamp

    const beforeTables = Object.keys(beforeForComparison.tables || {})
    const afterTables = Object.keys(afterForComparison.tables || {})

    if (beforeTables.length !== afterTables.length) {
      console.error(`Table count mismatch: ${beforeTables.length} vs ${afterTables.length}`)
      return false
    }

    let allMatch = true

    for (const table of beforeTables) {
      if (!afterForComparison.tables[table]) {
        console.error(`Table ${table} missing in after snapshot`)
        allMatch = false
        continue
      }

      const beforeTable = beforeForComparison.tables[table]
      const afterTable = afterForComparison.tables[table]

      // Check for errors
      if ('error' in beforeTable || 'error' in afterTable) {
        if ('error' in beforeTable && 'error' in afterTable) {
          if (beforeTable.error !== afterTable.error) {
            console.error(
              `Table ${table} error mismatch: ${beforeTable.error} vs ${afterTable.error}`
            )
            allMatch = false
          }
        } else {
          console.error(`Table ${table} error state mismatch`)
          allMatch = false
        }
        continue
      }

      // Compare row counts
      const beforeCount = beforeTable.rowCount || 0
      const afterCount = afterTable.rowCount || 0

      if (beforeCount !== afterCount) {
        console.error(`Table ${table} row count mismatch: ${beforeCount} vs ${afterCount}`)
        allMatch = false
        continue
      }

      // Compare actual data rows - exact match required
      const beforeData = beforeTable.data || []
      const afterData = afterTable.data || []

      if (beforeData.length !== afterData.length) {
        console.error(
          `Table ${table} data array length mismatch: ${beforeData.length} vs ${afterData.length}`
        )
        allMatch = false
        continue
      }

      // Compare each row exactly (as objects)
      for (let i = 0; i < beforeData.length; i++) {
        const beforeRow = beforeData[i]
        const afterRow = afterData[i]

        // Deep comparison using JSON.stringify
        const beforeJson = JSON.stringify(beforeRow)
        const afterJson = JSON.stringify(afterRow)

        if (beforeJson !== afterJson) {
          console.error(`Table ${table} row ${i} mismatch:`)
          console.error(`  Expected: ${beforeJson}`)
          console.error(`  Actual:   ${afterJson}`)
          allMatch = false
        }
      }
    }

    if (!allMatch) {
      console.error('✗ Database snapshot comparison failed - data changed')
    }

    return allMatch
  } catch (error) {
    console.error('Failed to compare snapshots:', error)
    return false
  }
}
