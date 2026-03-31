import { Outlet } from '@tanstack/react-router'
import { ChallengeProvider } from './ChallengeContext'
import { OSMDataProvider } from './OSMDataContext'
import { ProjectProvider } from './ProjectContext'
import { TaskBundleProvider } from './TaskBundleContext'
import { TaskProvider } from './TaskContext'
import { TaskMapProvider } from './TaskMapContext'

export const TasksLayout = () => {
  return (
    <TaskProvider>
      <TaskMapProvider>
        <OSMDataProvider>
          <ChallengeProvider>
            <ProjectProvider>
              <TaskBundleProvider>
                <Outlet />
              </TaskBundleProvider>
            </ProjectProvider>
          </ChallengeProvider>
        </OSMDataProvider>
      </TaskMapProvider>
    </TaskProvider>
  )
}
