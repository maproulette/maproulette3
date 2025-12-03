import { Outlet } from '@tanstack/react-router'
import { ChallengeProvider } from '@/contexts/tasks/ChallengeContext'
import { ProjectProvider } from '@/contexts/tasks/ProjectContext'
import { TaskBundleProvider } from '@/contexts/tasks/TaskBundleContext'
import { TaskProvider } from '@/contexts/tasks/TaskContext'
import { TaskMapContextProvider } from '@/contexts/tasks/TaskMapContext'

export const TasksLayout = () => {
  return (
    <TaskMapContextProvider>
      <TaskProvider>
        <ChallengeProvider>
          <ProjectProvider>
            <TaskBundleProvider>
              <Outlet />
            </TaskBundleProvider>
          </ProjectProvider>
        </ChallengeProvider>
      </TaskProvider>
    </TaskMapContextProvider>
  )
}
