import { spawn, ChildProcess, execSync } from 'node:child_process'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { getDatabaseConfig, getDatabaseUrl } from './database'

const fs = { existsSync }

const BACKEND_DIR = process.env.MAPROULETTE_BACKEND_DIR || join(process.cwd(), '../maproulette-backend')
const BACKEND_PORT = process.env.MR_BACKEND_PORT || '9001'  // Use 9001 for tests to avoid conflicts
const AKKA_PORT = process.env.MR_AKKA_PORT || '25520'  // Akka remote port
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`

let backendProcess: ChildProcess | null = null

export function getBackendUrl(): string {
  return BACKEND_URL
}

/**
 * Check if a port is in use and optionally kill the process using it
 */
async function checkAndFreePort(port: number): Promise<void> {
  try {
    // On macOS/Linux, use lsof to find processes using the port
    const output = execSync(`lsof -ti:${port}`, { encoding: 'utf-8', stdio: 'pipe' })
    const pids = output.trim().split('\n').filter(pid => pid.length > 0)
    
    if (pids.length > 0) {
      console.log(`[BACKEND] Port ${port} is in use by process(es): ${pids.join(', ')}`)
      console.log(`[BACKEND] Attempting to kill process(es) using port ${port}...`)
      
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'pipe' })
          console.log(`[BACKEND] ✓ Killed process ${pid}`)
        } catch (error) {
          console.warn(`[BACKEND] ⚠ Could not kill process ${pid}:`, error)
        }
      }
      
      // Wait a moment for the port to be released
      console.log(`[BACKEND] Waiting 2 seconds for port ${port} to be released...`)
      await new Promise<void>((resolve) => setTimeout(resolve, 2000))
    }
  } catch (error: any) {
    // lsof returns non-zero exit code if no process is using the port
    // This is expected and fine
    if (error.status !== 1) {
      console.warn(`[BACKEND] ⚠ Could not check port ${port}:`, error.message)
    }
  }
}

export async function startBackend(): Promise<void> {
  process.stdout.write('[BACKEND] Starting MapRoulette backend...\n')
  console.log('[BACKEND] Starting MapRoulette backend...')
  console.log(`[BACKEND] Backend directory: ${BACKEND_DIR}`)
  console.log(`[BACKEND] Backend port: ${BACKEND_PORT}`)
  console.log(`[BACKEND] Akka port: ${AKKA_PORT}`)
  console.log(`[BACKEND] Backend URL: ${BACKEND_URL}`)

  // Check and free the ports if they're in use
  await checkAndFreePort(parseInt(BACKEND_PORT, 10))
  await checkAndFreePort(parseInt(AKKA_PORT, 10))

  const dbConfig = getDatabaseConfig()
  const dbUrl = getDatabaseUrl()
  console.log(`[BACKEND] Database URL: ${dbUrl}`)
  console.log(`[BACKEND] Database user: ${dbConfig.username}`)

  // Set environment variables for backend
  const env = {
    ...process.env,
    MR_DATABASE_URL: dbUrl,
    MR_DATABASE_USERNAME: dbConfig.username,
    MR_DATABASE_PASSWORD: dbConfig.password,
    MR_BACKEND_PORT: BACKEND_PORT,
    MR_AKKA_PORT: AKKA_PORT,
    APPLICATION_SECRET:
      process.env.APPLICATION_SECRET ||
      'TEST_SECRET_KEY_32_CHARS_LONG_12345678901234567890',
    MAPROULETTE_SECRET_KEY:
      process.env.MAPROULETTE_SECRET_KEY ||
      'TEST_SECRET_KEY_32_CHARS_LONG_12345678901234567890',
    MR_OSM_SERVER: process.env.MR_OSM_SERVER || 'https://master.apis.dev.openstreetmap.org',
    MR_OAUTH_CONSUMER_KEY: process.env.MR_OAUTH_CONSUMER_KEY || 'test_key',
    MR_OAUTH_CONSUMER_SECRET: process.env.MR_OAUTH_CONSUMER_SECRET || 'test_secret',
  }

  return new Promise((resolve, reject) => {
    // Check if sbt is available
    console.log('[BACKEND] Checking if sbt is available...')
    try {
      const sbtCheck = spawn('sbt', ['-version'], {
        cwd: BACKEND_DIR,
        stdio: 'pipe',
      })

      sbtCheck.on('error', (error) => {
        console.error('[BACKEND] ✗ sbt check failed:', error)
        reject(
          new Error(
            `sbt not found. Please install sbt to run the backend. Error: ${error.message}`,
          ),
        )
      })

      sbtCheck.on('close', (code) => {
        if (code !== 0) {
          console.error(`[BACKEND] ✗ sbt check failed with exit code ${code}`)
          reject(new Error('sbt check failed'))
          return
        }

        console.log('[BACKEND] ✓ sbt is available')

        // Generate routes file before starting the server
        // This is required for Swagger generation to work properly
        console.log('[BACKEND] Generating routes file...')
        try {
          execSync('sbt generateRoutesFile', {
            cwd: BACKEND_DIR,
            env,
            stdio: 'inherit',
            timeout: 60000, // 60 second timeout
          })
          console.log('[BACKEND] ✓ Routes file generated')
        } catch (error: any) {
          console.warn('[BACKEND] ⚠ Failed to generate routes file, continuing anyway:', error.message)
          // Continue anyway - the compile task should generate it
        }

        // Start the backend server
        console.log(`[BACKEND] Starting backend server in ${BACKEND_DIR}...`)

        // Use test.conf if it exists, otherwise fall back to dev.conf
        const testConfigPath = join(BACKEND_DIR, 'conf/test.conf')
        const devConfigPath = join(BACKEND_DIR, 'conf/dev.conf')
        const configFile = fs.existsSync(testConfigPath)
          ? testConfigPath
          : devConfigPath
        
        console.log(`[BACKEND] Using config file: ${configFile}`)
        console.log(`[BACKEND] Config file exists: ${fs.existsSync(configFile)}`)

        console.log('[BACKEND] Spawning sbt process...')
        backendProcess = spawn(
          'sbt',
          [
            '-J-Xms2G',
            '-J-Xmx4G',
            `-J-Dconfig.file=${configFile}`,
            `-J-Dhttp.port=${BACKEND_PORT}`,
            '-J-Dlogger.resource=logback-dev.xml',
            'run',
          ],
          {
            cwd: BACKEND_DIR,
            env,
            stdio: 'pipe',
          },
        )

        console.log('[BACKEND] sbt process spawned (PID: ' + (backendProcess.pid || 'unknown') + ')')
        console.log('[BACKEND] Waiting for backend to compile and start (this may take several minutes)...')

        let outputBuffer = ''
        let errorBuffer = ''
        let resolved = false

        backendProcess.stdout?.on('data', (data) => {
          const output = data.toString()
          outputBuffer += output
          // Only log important lines to reduce noise
          if (output.includes('Listening for HTTP') || 
              output.includes('Server started') ||
              output.includes('ERROR') ||
              output.includes('Exception')) {
            console.log(`[BACKEND OUTPUT] ${output.trim()}`)
          }
          process.stdout.write(output)
        })

        backendProcess.stderr?.on('data', (data) => {
          const error = data.toString()
          errorBuffer += error
          // Log stderr output
          if (error.includes('ERROR') || error.includes('Exception') || error.includes('WARN')) {
            console.log(`[BACKEND ERROR] ${error.trim()}`)
          }
          process.stderr.write(error)
        })

        backendProcess.on('error', (error) => {
          if (!resolved) {
            resolved = true
            console.error('[BACKEND] ✗ Process error:', error)
            reject(new Error(`Failed to start backend: ${error.message}`))
          }
        })

        backendProcess.on('exit', (code) => {
          if (code !== 0 && code !== null && !resolved) {
            resolved = true
            console.error(`[BACKEND] ✗ Process exited with code ${code}`)
            reject(
              new Error(
                `Backend process exited with code ${code}\nOutput: ${outputBuffer}\nError: ${errorBuffer}`,
              ),
            )
          }
        })

        // Timeout after 10 minutes (in CI, compilation can take 5+ minutes, plus health checks)
        const timeoutMinutes = process.env.CI ? 10 : 5
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true
            console.error(`[BACKEND] ✗ Startup timeout after ${timeoutMinutes} minutes`)
            reject(new Error(`Backend startup timeout after ${timeoutMinutes} minutes`))
          }
        }, timeoutMinutes * 60 * 1000)

        // Wait a bit for sbt to start, then begin health checks
        // In CI, give more time for sbt to initialize and start compilation
        const initialWaitTime = process.env.CI ? 30000 : 10000
        console.log(`[BACKEND] Waiting ${initialWaitTime / 1000} seconds for sbt to initialize, then starting health checks...`)
        setTimeout(() => {
          console.log('[BACKEND] Starting HTTP health checks...')
          // Wait for server to be ready via HTTP check
          waitForBackend()
            .then(() => {
              if (!resolved) {
                resolved = true
                clearTimeout(timeoutId)
                console.log('[BACKEND] ✓ Backend is responding to HTTP requests')
                resolve()
              }
            })
            .catch((error) => {
              if (!resolved) {
                resolved = true
                clearTimeout(timeoutId)
                console.error('[BACKEND] ✗ Health check failed:', error)
                reject(error)
              }
            })
        }, initialWaitTime)
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function waitForBackend(maxRetries?: number): Promise<void> {
  // In CI, backend compilation can take much longer, so use more retries
  // Default to 150 retries (5 minutes) in CI, 60 retries (2 minutes) locally
  const defaultRetries = process.env.CI ? 150 : 60
  const retries = maxRetries ?? defaultRetries
  console.log(`[BACKEND HEALTH] Starting health checks (max ${retries} attempts, 2s between attempts, ~${retries * 2}s total)...`)
  const http = await import('node:http')
  const url = new URL(BACKEND_URL)
  const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80)
  
  for (let i = 0; i < retries; i++) {
    const attempt = i + 1
    if (attempt % 5 === 0 || attempt === 1) {
      console.log(`[BACKEND HEALTH] Attempt ${attempt}/${retries} - checking ${BACKEND_URL}/ping...`)
    }
    
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(
          {
            hostname: url.hostname,
            port: port,
            path: '/ping',
            timeout: 5000,
          },
          (res) => {
            // Only 200 means the server is fully ready
            // Other status codes mean the server is responding but may not be ready
            res.resume() // Consume response to free up memory
            if (res.statusCode === 200) {
              console.log(`[BACKEND HEALTH] ✓ Backend is ready (status ${res.statusCode})`)
              resolve()
            } else {
              // Server is responding but not ready yet
              reject(new Error(`Status: ${res.statusCode}`))
            }
          },
        )
        req.on('error', (err) => {
          // Connection errors mean the server isn't ready yet
          // Don't log every connection error, only on specific attempts
          if (attempt % 5 === 0) {
            console.log(`[BACKEND HEALTH] Connection error (attempt ${attempt}): ${err.message}`)
          }
          reject(err)
        })
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
      })
      // If we get here, the health check passed
      return
    } catch (error: any) {
      // Server not ready yet, wait and retry
      if (attempt === retries) {
        console.error(`[BACKEND HEALTH] ✗ All ${retries} attempts failed. Last error:`, error)
        throw new Error(`Backend did not become ready within ${retries * 2} seconds. Last error: ${error.message || error}`)
      }
      // Continue to next attempt
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error(`Backend did not become ready within ${retries * 2} seconds`)
}

export function stopBackend(): void {
  if (backendProcess) {
    console.log('Stopping backend server...')
    backendProcess.kill('SIGTERM')

    // Force kill after 10 seconds if still running
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log('Force killing backend process...')
        backendProcess.kill('SIGKILL')
      }
    }, 10000)

    backendProcess = null
    console.log('✓ Backend server stopped')
  }
}

