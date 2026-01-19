import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { Loader } from '@/components/ui/Loader'
import { useTaskContext } from '../contexts/TaskContext'
import { useTaskMapContext } from '../contexts/TaskMapContext'
import { MapControls } from './MapControls'
import { TaskMapManager } from './TaskMapManager'

export const TaskMap = () => {
  const { mapContainer, mapLoaded, clusteringEnabled, setClusteringEnabled } = useTaskMapContext()
  const { task } = useTaskContext()

  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(task.parent)
  )

  return (
    <div className="relative flex-1 md:h-[calc(100vh-6rem)]">
      <div className="relative h-full w-full">
        <div ref={mapContainer} data-mapgrab-map-id="taskMap" className="h-full w-full" />
        <div
          className={`absolute inset-0 z-10 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm transition-opacity duration-300 dark:bg-zinc-950/80 ${
            isLoadingTaskMarkers || !mapLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Loader message="Loading task markers..." />
        </div>
        <ClusterToggle
          disabled={isLoadingTaskMarkers || !mapLoaded}
          taskCount={taskMarkers?.length}
          clusteringEnabled={clusteringEnabled}
          onToggle={setClusteringEnabled}
        />
        <MapControls />
        <TaskMapManager />
      </div>
    </div>
  )
}
