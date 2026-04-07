import { Outlet } from '@tanstack/react-router'
import { MapProvider } from 'react-map-gl/maplibre'
import { ChallengeProvider } from './contexts/ChallengeContext'
import { OSMDataProvider } from './contexts/OSMDataContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { TaskBundleProvider } from './contexts/TaskBundleContext'
import { TaskProvider } from './contexts/TaskContext'
import { TaskMapProvider } from './contexts/TaskMapContext'
import { TaskEditMapProvider } from './TaskMap/TaskEditMapContext'
import { useLassoEvents } from './TaskMap/useLassoEvents'

const LassoEventsInitializer = () => {
  useLassoEvents()
  return null
}

export const TasksLayout = () => {
  return (
    <TaskProvider>
      <ChallengeProvider>
        <ProjectProvider>
          <TaskBundleProvider>
            <MapProvider>
              <TaskMapProvider>
                <OSMDataProvider>
                  <TaskEditMapProvider>
                    <LassoEventsInitializer />
                    <Outlet />
                  </TaskEditMapProvider>
                </OSMDataProvider>
              </TaskMapProvider>
            </MapProvider>
          </TaskBundleProvider>
        </ProjectProvider>
      </ChallengeProvider>
    </TaskProvider>
  )
}
