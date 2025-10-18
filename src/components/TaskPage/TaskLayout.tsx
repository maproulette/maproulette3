import { Outlet } from '@tanstack/react-router'
import { TaskProvider } from '@/contexts/tasks/TaskContext'
import { ChallengeProvider } from '@/contexts/tasks/ChallengeContext'
import { ProjectProvider } from '@/contexts/tasks/ProjectContext'

export const TasksLayout = () => {
  return (
    <TaskProvider>
      <ChallengeProvider>
        <ProjectProvider>
          <Outlet />
        </ProjectProvider>
      </ChallengeProvider>
    </TaskProvider>
  )
}
