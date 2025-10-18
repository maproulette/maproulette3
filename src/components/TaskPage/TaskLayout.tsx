import { Outlet } from '@tanstack/react-router'
import { ChallengeProvider } from '@/contexts/tasks/ChallengeContext'
import { ProjectProvider } from '@/contexts/tasks/ProjectContext'
import { TaskProvider } from '@/contexts/tasks/TaskContext'

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
