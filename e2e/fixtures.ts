import { type APIRequestContext, test as base } from '@playwright/test'

const BACKEND_URL = 'http://localhost:9000'
const SUPER_KEY = 'super-secret-key'

const uniqueName = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`

export interface TestProject {
  id: number
  name: string
}

export interface TestChallenge {
  id: number
  name: string
  projectId: number
}

export interface TestTask {
  id: number
  name: string
  challengeId: number
}

async function createProject(request: APIRequestContext, name: string): Promise<TestProject> {
  const response = await request.post(`${BACKEND_URL}/api/v2/project`, {
    headers: { apiKey: SUPER_KEY, 'Content-Type': 'application/json' },
    data: {
      name,
      displayName: name,
      description: 'E2E test project',
      enabled: true,
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create project: ${response.status()} ${await response.text()}`)
  }
  const body = (await response.json()) as { id: number }
  return { id: body.id, name }
}

async function deleteProject(request: APIRequestContext, id: number): Promise<void> {
  try {
    const response = await request.delete(`${BACKEND_URL}/api/v2/project/${id}?immediate=true`, {
      headers: { apiKey: SUPER_KEY },
    })
    if (!response.ok()) {
      console.warn(`Project ${id} teardown returned ${response.status()}: ${await response.text()}`)
    }
  } catch (error) {
    console.warn(`Project ${id} teardown threw:`, error)
  }
}

// Note: creating a challenge with `localGeoJSON`, or uploading tasks via the
// addFileTasks endpoint, does not reliably produce tasks against the pinned
// backend image (a server-side Scala collections bug silently fails async
// task import). Creating the challenge shell and its tasks directly via their
// own JSON-body endpoints (below) sidesteps that entirely and is immediate.
async function createChallenge(
  request: APIRequestContext,
  projectId: number,
  name: string
): Promise<TestChallenge> {
  const response = await request.post(`${BACKEND_URL}/api/v2/challenge`, {
    headers: { apiKey: SUPER_KEY, 'Content-Type': 'application/json' },
    data: {
      parent: projectId,
      name,
      description: 'E2E test challenge',
      instruction: 'Fix the identified issue.',
      difficulty: 2,
      enabled: true,
      featured: false,
      overpassQL: '',
      overpassTargetType: '',
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create challenge: ${response.status()} ${await response.text()}`)
  }
  const body = (await response.json()) as { id: number }
  return { id: body.id, name, projectId }
}

async function createTask(
  request: APIRequestContext,
  challengeId: number,
  name: string,
  coordinates: [number, number] = [-95.454772, 37.6866588]
): Promise<TestTask> {
  const response = await request.post(`${BACKEND_URL}/api/v2/task`, {
    headers: { apiKey: SUPER_KEY, 'Content-Type': 'application/json' },
    data: {
      name,
      parent: challengeId,
      instruction: 'Fix this point.',
      geometries: {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates }, properties: {} }],
      },
      priority: 0,
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to create task: ${response.status()} ${await response.text()}`)
  }
  const body = (await response.json()) as { id: number }
  return { id: body.id, name, challengeId }
}

export const test = base.extend<{ project: TestProject; challenge: TestChallenge; task: TestTask }>(
  {
    project: async ({ request }, use) => {
      const project = await createProject(request, uniqueName('e2e-project'))
      await use(project)
      await deleteProject(request, project.id)
    },

    // Deleting `project` (above) cascades to its challenges and tasks on the
    // backend, so neither fixture below needs its own teardown.
    challenge: async ({ request, project }, use) => {
      const challenge = await createChallenge(request, project.id, uniqueName('e2e-challenge'))
      await use(challenge)
    },

    task: async ({ request, challenge }, use) => {
      const task = await createTask(request, challenge.id, uniqueName('e2e-task'))
      await use(task)
    },
  }
)

export { expect } from '@playwright/test'
