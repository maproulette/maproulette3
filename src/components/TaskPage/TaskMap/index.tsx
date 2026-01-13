import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { Loader } from '@/components/ui/Loader'
import { usePluginContext } from '@/contexts/PluginContext'
import { useOSMDataContext } from './contexts/OSMDataContext'
import { useTaskContext } from './contexts/TaskContext'
import { useTaskMapContext } from './contexts/TaskMapContext'
import type { TaskMapEditor } from '@/types/Plugin'
import { MapControls } from './MapControls'
import { OSMDataLayer } from './OSMDataLayer'
import { TaskFeaturesLayer } from './TaskFeaturesLayer'

export const TaskMap = () => {
  const { mapLoaded, mapContainer, clusteringEnabled, setClusteringEnabled } = useTaskMapContext()
  const { task } = useTaskContext()
  const { getTaskMapEditors } = usePluginContext()
  const [activeEditorId, setActiveEditorId] = useState<string | null>(null)
  const [availableEditors, setAvailableEditors] = useState<TaskMapEditor[]>([])
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

        {activeEditor && (
          <div className="absolute inset-0 z-50">
            <activeEditor.component onClose={handleCloseEditor} />
          </div>
        )}

        <TaskFeaturesLayer showTaskFeatures={showTaskFeatures} dataLayerOrder={dataLayerOrder} />
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
