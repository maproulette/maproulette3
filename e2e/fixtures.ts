import { type APIRequestContext, test as base } from '@playwright/test'

const BACKEND_URL = 'http://localhost:9000'
const SUPER_KEY = 'super-secret-key'

export interface TestProject {
  id: number
  name: string
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

export const test = base.extend<{ project: TestProject }>({
  project: async ({ request }, use) => {
    const name = `e2e-project-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
    const project = await createProject(request, name)
    await use(project)
    await deleteProject(request, project.id)
  },
})

export { expect } from '@playwright/test'
