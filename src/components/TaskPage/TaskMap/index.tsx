import { useMapContext } from '@/contexts/MapContext'
import { TaskMarkers } from '@/components/TaskMarkers'
import { api } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { Loader } from '@/components/ui/Loader'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { MapControls } from './MapControls'

export const TaskMap = () => {
  const { mapLoaded, mapContainer } = useMapContext()
  const { task } = useTaskContext()
  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(task.parent)
  )
 
  return (
    <div className="relative flex-1" style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="relative h-full w-full">
        <div ref={mapContainer} className="h-full w-full" />
        <div
        className={`absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm transition-opacity duration-200 ${
          isLoadingTaskMarkers || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Loader message="Loading task markers..." />
      </div>
        <TaskMarkers 
          taskMarkers={taskMarkers} 
          isLoadingTaskMarkers={isLoadingTaskMarkers}
          zoomToTaskId={task.id.toString()}
        />
        <MapControls />
        {/* <TaskFeatures /> */}
      </div>
    </div>
  )
}
