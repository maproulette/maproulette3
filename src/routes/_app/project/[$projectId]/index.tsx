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
          title:
            project && ('displayName' in project || 'name' in project)
              ? `Project: ${('displayName' in project ? project.displayName : null) || ('name' in project ? project.name : null) || 'Unknown'}`
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
