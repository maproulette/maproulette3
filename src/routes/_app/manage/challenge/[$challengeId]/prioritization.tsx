import { createFileRoute, useParams } from '@tanstack/react-router'
import { TaskPrioritizationPage } from '@/components/Pages/ManagementPages/TaskPrioritizationPage'

const PrioritizationRouteComponent = () => {
  const { challengeId } = useParams({ from: '/_app/manage/challenge/$challengeId/prioritization' })
  return <TaskPrioritizationPage challengeId={Number(challengeId)} />
}

export const Route = createFileRoute('/_app/manage/challenge/$challengeId/prioritization')({
  staticData: { pageTitle: 'Task Prioritization' },
  component: PrioritizationRouteComponent,
})
