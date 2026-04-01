import { Outlet } from '@tanstack/react-router'
import { MapProvider } from 'react-map-gl/maplibre'
import { ChallengeProvider } from './ChallengeContext'
import { OSMDataProvider } from './OSMDataContext'
import { ProjectProvider } from './ProjectContext'
import { TaskBundleProvider } from './TaskBundleContext'
import { TaskProvider } from './TaskContext'
import { TaskEditMapProvider } from './TaskMap/TaskEditMapContext'
import { useLassoEvents } from './TaskMap/useLassoEvents'
import { TaskMapProvider } from './TaskMapContext'

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
