import { createFileRoute } from '@tanstack/react-router'

const ProjectNotReady = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 text-2xl font-bold">This page is not ready</h1>
      <p className="text-muted-foreground">
        The browse project page is currently under development. Please check
        back later.
      </p>
    </div>
  )
}

export const Route = createFileRoute('/_app/project/$projectId/')({
  staticData: { pageTitle: 'Browse Project' },
  head: () => ({
    meta: [{ title: 'Browse Project' }],
  }),
  component: ProjectNotReady,
})
