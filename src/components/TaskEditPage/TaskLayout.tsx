import { Outlet } from '@tanstack/react-router'
import { ChallengeProvider } from '@/components/TaskEditPage/ChallengeContext'
import { OSMDataProvider } from '@/components/TaskEditPage/OSMDataContext'
import { ProjectProvider } from '@/components/TaskEditPage/ProjectContext'
import { TaskBundleProvider } from '@/components/TaskEditPage/TaskBundleContext'
import { TaskProvider } from '@/components/TaskEditPage/TaskContext'
import { TaskMapProvider } from '@/components/TaskEditPage/TaskMapContext'

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
