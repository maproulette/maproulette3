import { type ChildProcess, execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getDatabaseConfig, getDatabaseUrl } from './database'

const fs = { existsSync }

const BACKEND_DIR =
  process.env.MAPROULETTE_BACKEND_DIR || join(process.cwd(), '../maproulette-backend')
const BACKEND_PORT = process.env.MR_BACKEND_PORT || '9001'
const AKKA_PORT = process.env.MR_AKKA_PORT || '25520'
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
    const output = execSync(`lsof -ti:${port}`, { encoding: 'utf-8', stdio: 'pipe' })
    const pids = output
      .trim()
      .split('\n')
      .filter((pid) => pid.length > 0)

    if (pids.length > 0) {
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'pipe' })
        } catch (error) {
          console.warn(`[BACKEND] ⚠ Could not kill process ${pid}:`, error)
        }
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 2000))
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status !== 1) {
      const message =
        'message' in error && typeof error.message === 'string' ? error.message : String(error)
      console.warn(`[BACKEND] ⚠ Could not check port ${port}:`, message)
    }
  }
}

export async function startBackend(): Promise<void> {
  process.stdout.write('[BACKEND] Starting MapRoulette backend...\n')

  await checkAndFreePort(parseInt(BACKEND_PORT, 10))
  await checkAndFreePort(parseInt(AKKA_PORT, 10))

  const dbConfig = getDatabaseConfig()
  const dbUrl = getDatabaseUrl()

  const sbtOpts = [process.env.SBT_OPTS, '-Xss4m'].filter(Boolean).join(' ')
  const env = {
    ...process.env,
    SBT_OPTS: sbtOpts,
    MR_DATABASE_URL: dbUrl,
    MR_DATABASE_USERNAME: dbConfig.username,
    MR_DATABASE_PASSWORD: dbConfig.password,
    MR_BACKEND_PORT: BACKEND_PORT,
    MR_AKKA_PORT: AKKA_PORT,
    APPLICATION_SECRET:
      process.env.APPLICATION_SECRET || 'TEST_SECRET_KEY_32_CHARS_LONG_12345678901234567890',
    MAPROULETTE_SECRET_KEY:
      process.env.MAPROULETTE_SECRET_KEY || 'TEST_SECRET_KEY_32_CHARS_LONG_12345678901234567890',
    MR_OSM_SERVER: process.env.MR_OSM_SERVER || 'https://master.apis.dev.openstreetmap.org',
    MR_OAUTH_CONSUMER_KEY: process.env.MR_OAUTH_CONSUMER_KEY || 'test_key',
    MR_OAUTH_CONSUMER_SECRET: process.env.MR_OAUTH_CONSUMER_SECRET || 'test_secret',
  }

  return new Promise((resolve, reject) => {
    try {
      const sbtCheck = spawn('sbt', ['-version'], {
        cwd: BACKEND_DIR,
        stdio: 'pipe',
      })

      sbtCheck.on('error', (error) => {
        console.error('[BACKEND] ✗ sbt check failed:', error)
        reject(
          new Error(`sbt not found. Please install sbt to run the backend. Error: ${error.message}`)
        )
      })

      sbtCheck.on('close', (code) => {
        if (code !== 0) {
          console.error(`[BACKEND] ✗ sbt check failed with exit code ${code}`)
          reject(new Error('sbt check failed'))
          return
        }

        try {
          execSync('sbt generateRoutesFile', {
            cwd: BACKEND_DIR,
            env,
            stdio: 'inherit',
            timeout: 60000,
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error)
          console.warn('[BACKEND] ⚠ Failed to generate routes file, continuing anyway:', message)
        }

        const testConfigPath = join(BACKEND_DIR, 'conf/test.conf')
        const devConfigPath = join(BACKEND_DIR, 'conf/dev.conf')
        const configFile = fs.existsSync(testConfigPath) ? testConfigPath : devConfigPath

        backendProcess = spawn(
          'sbt',
          [
            '-J-Xms2G',
            '-J-Xmx4G',
            '-J-Xss4m',
            `-J-Dconfig.file=${configFile}`,
            `-J-Dhttp.port=${BACKEND_PORT}`,
            '-J-Dlogger.resource=logback-dev.xml',
            'run',
          ],
          {
            cwd: BACKEND_DIR,
            env,
            stdio: 'pipe',
          }
        )

        let outputBuffer = ''
        let errorBuffer = ''
        let resolved = false

        backendProcess.stdout?.on('data', (data) => {
          const output = data.toString()
          outputBuffer += output

          if (
            output.includes('Listening for HTTP') ||
            output.includes('Server started') ||
            output.includes('ERROR') ||
            output.includes('Exception')
          ) {
          }
          process.stdout.write(output)
        })

        backendProcess.stderr?.on('data', (data) => {
          const error = data.toString()
          errorBuffer += error

          if (error.includes('ERROR') || error.includes('Exception') || error.includes('WARN')) {
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
                `Backend process exited with code ${code}\nOutput: ${outputBuffer}\nError: ${errorBuffer}`
              )
            )
          }
        })

        const timeoutMinutes = process.env.CI ? 10 : 5
        const timeoutId = setTimeout(
          () => {
            if (!resolved) {
              resolved = true
              console.error(`[BACKEND] ✗ Startup timeout after ${timeoutMinutes} minutes`)
              reject(new Error(`Backend startup timeout after ${timeoutMinutes} minutes`))
            }
          },
          timeoutMinutes * 60 * 1000
        )

        const initialWaitTime = process.env.CI ? 30000 : 10000

        setTimeout(() => {
          waitForBackend()
            .then(() => {
              if (!resolved) {
                resolved = true
                clearTimeout(timeoutId)

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
  const defaultRetries = process.env.CI ? 150 : 60
  const retries = maxRetries ?? defaultRetries

  const http = await import('node:http')
  const url = new URL(BACKEND_URL)
  const port = url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80

  for (let i = 0; i < retries; i++) {
    const attempt = i + 1
    if (attempt % 5 === 0 || attempt === 1) {
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
            res.resume()
            if (res.statusCode === 200) {
              resolve()
            } else {
              reject(new Error(`Status: ${res.statusCode}`))
            }
          }
        )
        req.on('error', (err) => {
          if (attempt % 5 === 0) {
          }
          reject(err)
        })
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })
      })

      return
    } catch (error: unknown) {
      if (attempt === retries) {
        console.error(`[BACKEND HEALTH] ✗ All ${retries} attempts failed. Last error:`, error)
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(
          `Backend did not become ready within ${retries * 2} seconds. Last error: ${message}`
        )
      }
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  }

  throw new Error(`Backend did not become ready within ${retries * 2} seconds`)
}

export function stopBackend(): void {
  if (backendProcess) {
    backendProcess.kill('SIGTERM')

    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGKILL')
      }
    }, 10000)

    backendProcess = null
  }
}
