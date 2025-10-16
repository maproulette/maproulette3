import { Outlet } from '@tanstack/react-router'
import { TaskProvider } from '@/contexts/tasks/contexts/TaskContext'
import { ChallengeProvider } from '@/contexts/tasks/contexts/ChallengeContext'
import { ProjectProvider } from '@/contexts/tasks/contexts/ProjectContext'

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
