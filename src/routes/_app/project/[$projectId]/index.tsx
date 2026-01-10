import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { BrowsedProjectPage } from '@/components/BrowsedProjectPage'
import type { Project } from '@/types/Project'

export const Route = createFileRoute('/_app/project/$projectId/')({
  head: ({ loaderData }) => {
    const { project }: { project: Project } = loaderData ?? {
      project: undefined as unknown as Project,
    }

    return {
      meta: [
        {
          title: project?.displayName || project?.name
            ? `Project: ${project.displayName || project.name}`
            : 'Loading project',
        },
      ],
    }
  },
  loader: async ({ context, params: { projectId } }) => {
    const project = await context.queryClient.ensureQueryData(
      api.project.getProject(Number(projectId))
    )

    return { project }
  },
  onError(error) {
    console.error('Error loading project route', error)
    notFound({ throw: true })
  },
  component: BrowsedProjectPage,
})
