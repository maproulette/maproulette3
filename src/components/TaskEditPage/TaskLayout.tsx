import { Outlet } from '@tanstack/react-router'
import { ChallengeProvider } from './contexts/ChallengeContext'
import { OSMDataProvider } from './contexts/OSMDataContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { TaskBundleProvider } from './contexts/TaskBundleContext'
import { TaskProvider } from './contexts/TaskContext'

export const TasksLayout = () => {
  return (
    <OSMDataProvider>
      <TaskProvider>
        <ChallengeProvider>
          <ProjectProvider>
            <TaskBundleProvider>
              <Outlet />
            </TaskBundleProvider>
          </ProjectProvider>
        </ChallengeProvider>
      </TaskProvider>
    </OSMDataProvider>
  )
}
