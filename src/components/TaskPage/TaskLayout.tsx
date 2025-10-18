import { Outlet } from '@tanstack/react-router'
import { MapContextProvider } from '@/contexts/MapContext'
import { ChallengeProvider } from '@/contexts/tasks/ChallengeContext'
import { ProjectProvider } from '@/contexts/tasks/ProjectContext'
import { TaskProvider } from '@/contexts/tasks/TaskContext'

export const TasksLayout = () => {
  return (
    <TaskProvider>
      <ChallengeProvider>
        <ProjectProvider>
          <MapContextProvider>
            <Outlet />
          </MapContextProvider>
        </ProjectProvider>
      </ChallengeProvider>
    </TaskProvider>
  )
}
