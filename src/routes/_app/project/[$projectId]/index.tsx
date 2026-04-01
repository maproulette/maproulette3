import { createFileRoute, notFound } from '@tanstack/react-router'
import { api } from '@/api'
import { BrowsedProjectPage } from '@/components/BrowsedProjectPage'

export const Route = createFileRoute('/_app/project/$projectId/')({
  staticData: { pageTitle: 'Browse Project' },
  loader: async ({ params: { projectId }, context: { queryClient } }) => {
    const project = await queryClient.ensureQueryData(
      api.project.getProjectOptions(Number(projectId))
    )

    return { project }
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project

    return {
      meta: [
        {
          title: project?.displayName
            ? `Project: ${project.displayName}`
            : project?.name
              ? `Project: ${project.name}`
              : 'Loading project',
        },
      ],
    }
  },
  onError(error) {
    console.error('Error loading project route', error)
    notFound({ throw: true })
  },
  component: BrowsedProjectPage,
})
