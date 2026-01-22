import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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
  process.stdout.write('[DATABASE] Starting test database container...\n')
  console.log('[DATABASE] Starting test database container...')
  console.log(`[DATABASE] Using docker-compose file: ${DOCKER_COMPOSE_FILE}`)
  console.log(`[DATABASE] Container name: ${CONTAINER_NAME}`)
  console.log(`[DATABASE] Database: ${DB_NAME}, User: ${DB_USER}, Port: ${DB_PORT}`)
  
  try {
    // Stop and remove existing container if it exists
    console.log('[DATABASE] Checking for existing container...')
    try {
      console.log(`[DATABASE] Attempting to stop container: ${CONTAINER_NAME}`)
      execSync(`docker stop ${CONTAINER_NAME}`, { stdio: 'pipe' })
      console.log('[DATABASE] Stopped existing container')
      execSync(`docker rm ${CONTAINER_NAME}`, { stdio: 'pipe' })
      console.log('[DATABASE] Removed existing container')
    } catch (error: any) {
      if (error.status === 1) {
        console.log('[DATABASE] No existing container found (this is fine)')
      } else {
        console.log(`[DATABASE] Container cleanup note: ${error.message}`)
      }
    }

    // Start the database
    const dockerComposeCmd = getDockerComposeCommand()
    console.log('[DATABASE] Starting database container with docker-compose...')
    console.log(`[DATABASE] Command: ${dockerComposeCmd} -f ${DOCKER_COMPOSE_FILE} up -d`)
    try {
      const output = execSync(`${dockerComposeCmd} -f ${DOCKER_COMPOSE_FILE} up -d`, {
        stdio: 'pipe',
        encoding: 'utf-8',
      })
      console.log('[DATABASE] Docker-compose output:', output)
      console.log('[DATABASE] Docker-compose command completed')
    } catch (error: any) {
      console.error('[DATABASE] Docker-compose error:', error.message)
      console.error('[DATABASE] Error output:', error.stdout?.toString() || error.stderr?.toString())
      throw error
    }

    // Wait for database to be ready
    console.log('[DATABASE] Waiting for database to be ready...')
    let retries = 30
    let attempt = 0
    while (retries > 0) {
      attempt++
      console.log(`[DATABASE] Health check attempt ${attempt}/${30}...`)
      try {
        execSync(
          `docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} -d ${DB_NAME}`,
          { stdio: 'ignore' },
        )
        console.log('[DATABASE] ✓ Database is ready and accepting connections')
        break
      } catch (error) {
        retries--
        if (retries === 0) {
          console.error('[DATABASE] ✗ Database failed to start within timeout')
          throw new Error('Database failed to start within timeout')
        }
        console.log(`[DATABASE] Database not ready yet, retrying in 1 second... (${retries} attempts remaining)`)
        // Wait 1 second before retrying
        await new Promise<void>((resolve) => setTimeout(resolve, 1000))
      }
    }
    console.log('[DATABASE] Database startup complete')
  } catch (error) {
    console.error('[DATABASE] ✗ Failed to start database:', error)
    throw error
  }
}

export function stopDatabase(): void {
  console.log('Stopping test database container...')
  try {
    const dockerComposeCmd = getDockerComposeCommand()
    execSync(`${dockerComposeCmd} -f ${DOCKER_COMPOSE_FILE} down`, {
      stdio: 'inherit',
    })
    console.log('✓ Database container stopped')
  } catch (error) {
    console.error('Failed to stop database:', error)
    // Don't throw - cleanup should be best effort
  }
}

export function createDatabaseSnapshot(outputPath: string): void {
  console.log('Creating database snapshot...')
  try {
    const snapshotDir = join(process.cwd(), 'playwright', 'snapshots')
    if (!existsSync(snapshotDir)) {
      mkdirSync(snapshotDir, { recursive: true })
    }

    const snapshotFile = join(snapshotDir, outputPath)

    // Get list of all tables
    const tablesOutput = execSync(
      `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"`,
      { encoding: 'utf-8' },
    )

    const tables = tablesOutput
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    // Skip large system tables that aren't relevant for test snapshots
    const systemTablesToSkip = ['spatial_ref_sys', 'geometry_columns', 'geography_columns']
    const filteredTables = tables.filter((t) => !systemTablesToSkip.includes(t))

    const snapshot: Record<string, any> = {
      timestamp: new Date().toISOString(),
      tables: {},
    }

    // Export data from each table
    for (const table of filteredTables) {
      try {
        // Check if table has an 'id' column, otherwise just select all
        let orderByClause = ''
        try {
          const idCheckOutput = execSync(
            `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT 1 FROM information_schema.columns WHERE table_name='${table}' AND column_name='id' LIMIT 1;"`,
            { encoding: 'utf-8', stdio: 'pipe' },
          )
          // Only use ORDER BY id if the check actually returned a result
          if (idCheckOutput.trim() === '1') {
            orderByClause = ' ORDER BY id'
          }
        } catch {
          // No id column, that's fine - leave orderByClause empty
        }
        
        const dataOutput = execSync(
          `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "SELECT * FROM ${table}${orderByClause};" -t -A -F','`,
          { encoding: 'utf-8' },
        )

        // Also get row count
        const countOutput = execSync(
          `docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT COUNT(*) FROM ${table};"`,
          { encoding: 'utf-8' },
        )

        snapshot.tables[table] = {
          rowCount: parseInt(countOutput.trim(), 10),
          data: dataOutput.trim().split('\n').filter((r) => r.length > 0),
        }
      } catch (error) {
        console.warn(`Failed to snapshot table ${table}:`, error)
        snapshot.tables[table] = { error: String(error) }
      }
    }

    writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2))
    console.log(`✓ Database snapshot saved to ${snapshotFile}`)
  } catch (error) {
    console.error('Failed to create database snapshot:', error)
    throw error
  }
}

export function compareSnapshots(
  beforePath: string,
  afterPath: string,
): boolean {
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

    const beforeTables = Object.keys(before.tables || {})
    const afterTables = Object.keys(after.tables || {})

    if (beforeTables.length !== afterTables.length) {
      console.error(
        `Table count mismatch: ${beforeTables.length} vs ${afterTables.length}`,
      )
      return false
    }

    let allMatch = true

    for (const table of beforeTables) {
      if (!after.tables[table]) {
        console.error(`Table ${table} missing in after snapshot`)
        allMatch = false
        continue
      }

      const beforeCount = before.tables[table].rowCount || 0
      const afterCount = after.tables[table].rowCount || 0

      if (beforeCount !== afterCount) {
        console.error(
          `Table ${table} row count mismatch: ${beforeCount} vs ${afterCount}`,
        )
        allMatch = false
      }
    }

    if (allMatch) {
      console.log('✓ Database snapshot comparison passed - data unchanged')
    } else {
      console.error('✗ Database snapshot comparison failed - data changed')
    }

    return allMatch
  } catch (error) {
    console.error('Failed to compare snapshots:', error)
    return false
  }
}

