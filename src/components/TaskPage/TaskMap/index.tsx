import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { TaskMarkers } from '@/components/TaskMarkers'
import { Loader } from '@/components/ui/Loader'
import { usePluginContext } from '@/contexts/PluginContext'
import { useOSMDataContext } from '@/contexts/tasks/OSMDataContext'
import { useTaskBundleContext } from '@/contexts/tasks/TaskBundleContext'
import { useTaskContext } from '@/contexts/tasks/TaskContext'
import { useTaskMapContext } from '@/contexts/tasks/TaskMapContext'
import type { TaskMapEditor } from '@/types/Plugin'
import { MapControls } from './MapControls'
import { OSMDataLayer } from './OSMDataLayer'

export const TaskMap = () => {
  const {
    mapLoaded,
    mapContainer,
    map,
    clusteringEnabled,
    setClusteringEnabled,
    hoveredTaskId,
    selectedTaskIds,
    setSelectedTaskIds,
    currentStyleId,
  } = useTaskMapContext()
  const { task } = useTaskContext()
  const { getTaskMapEditors } = usePluginContext()
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null)
  const [availableEditors, setAvailableEditors] = useState<TaskMapEditor[]>([])
  const { visibleTaskIds } = useTaskBundleContext()
  const {
    showOSMData,
    osmData,
    showOSMElements,
    osmElementOrder,
    dataLayerOrder,
    showTaskFeatures,
  } = useOSMDataContext()

  const { data: taskMarkers, isLoading: isLoadingTaskMarkers } = useQuery(
    api.challenge.getChallengeTaskMarkers(task.parent)
  )

  useEffect(() => {
    const loadEditors = async () => {
      const editors = await getTaskMapEditors()
      setAvailableEditors(editors)
    }
    loadEditors()
  }, [getTaskMapEditors])

  const handleCloseEditor = () => {
    setActiveEditorId(null)
  }

  const activeEditor = availableEditors.find((editor) => editor.id === activeEditorId)

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

        {/* Editor Buttons - Dynamically loaded from plugins */}
        {!activeEditorId && availableEditors.length > 0 && (
          <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
            {availableEditors.map((editor) => (
              <button
                key={editor.id}
                type="button"
                onClick={() => setActiveEditorId(editor.id)}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-purple-700"
                title={editor.label}
              >
                {editor.icon}
                <span className="font-medium">{editor.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active Editor Overlay - Dynamically rendered from plugin */}
        {activeEditor && (
          <div className="absolute inset-0 z-50">
            <activeEditor.component onClose={handleCloseEditor} />
          </div>
        )}

        <TaskMarkers
          taskMarkers={taskMarkers}
          isLoadingTaskMarkers={isLoadingTaskMarkers}
          zoomToTaskId={task.id.toString()}
          visibleTaskIds={visibleTaskIds ?? undefined}
          map={map}
          mapLoaded={mapLoaded}
          clusteringEnabled={clusteringEnabled}
          hoveredTaskId={hoveredTaskId}
          selectedTaskIds={selectedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          onClusteringToggle={setClusteringEnabled}
          currentStyleId={currentStyleId}
          showTaskFeatures={showTaskFeatures}
        />
        {showOSMData && osmData && (
          <OSMDataLayer
            xmlData={osmData}
            showOSMElements={showOSMElements}
            elementOrder={osmElementOrder}
            dataLayerOrder={dataLayerOrder}
          />
        )}
      </div>
    </div>
  )
}
