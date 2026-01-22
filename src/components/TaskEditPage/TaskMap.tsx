import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { Task } from '@/types/Task'
import { useTaskBundleContext } from './contexts/TaskBundleContext'
import { useTaskContext } from './contexts/TaskContext'
import { BundleFilterToggle } from './TaskMap/BundleFilterToggle'
import { ClusterSource } from './TaskMap/ClusterSource'
import { clusterLayer, useTaskEditMap } from './TaskMap/hooks'
import { LoadingIndicator } from './TaskMap/LoadingIndicator'
import { MapPopups } from './TaskMap/MapPopups'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'
import { UnclusteredSource } from './TaskMap/UnclusteredSource'

export const TaskMap = () => {
  const { task } = useTaskContext()
  const {
    activeBundle,
    setActiveBundle,
    bundleEditsDisabled,
    clearBundle,
    setInitialBundle,
    showBundleOnly,
  } = useTaskBundleContext()

  const {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    popupInfo,
    setPopupInfo,
    defaultStyle,
    taskCount,
    shouldCluster,
    markersData,
    overlapData,
    isLoadingMarkers,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    geoJSONData,
    primaryTaskId,
  } = useTaskEditMap(showBundleOnly, activeBundle)

 
  const { data: primaryTaskData } = useQuery(api.task.getTask(primaryTaskId))

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 2,
  }

  const handleAddToBundle = (taskId: number) => {
    if (bundleEditsDisabled) return

   
    const taskToAddMarker = markersData.markers.find((m) => m.id === taskId)
    if (!taskToAddMarker) {
      console.error('Task not found in markers data')
      return
    }

    if (!activeBundle) {
     
      const primaryTask = (primaryTaskData as Task | undefined) || task
      const newBundle = {
        bundleId: 0,
        taskIds: [primaryTaskId, taskId],
        tasks: [primaryTask].filter(Boolean),
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
     
      setInitialBundle(null)
    } else {
     
      if (activeBundle.taskIds.includes(taskId)) {
        return
      }

      const updatedTaskIds = [...activeBundle.taskIds, taskId]

      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
       
        tasks: activeBundle.tasks,
      })
    }
  }

  const handleRemoveFromBundle = (taskId: number) => {
    if (!activeBundle || bundleEditsDisabled) return

    if (taskId === primaryTaskId) {
      return
    }

    if (!activeBundle.taskIds.includes(taskId)) {
      return
    }

    const updatedTasks = (activeBundle.tasks || []).filter((t) => t.id !== taskId)
    const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== taskId)

   
    if (updatedTaskIds.length <= 1) {
      clearBundle()
      return
    }

   
    setActiveBundle({
      ...activeBundle,
      taskIds: updatedTaskIds,
      tasks: updatedTasks,
    })
  }

  const handleOverlapTaskSelect = (taskId: number | null) => {
    if (popupInfo?.type === 'overlap') {
      setPopupInfo({
        ...popupInfo,
        selectedTaskId: taskId,
      })
    }
  }

  const handleOverlapMarkerClick = (
    tasks: (typeof markersData.markers)[0][],
    center: [number, number]
  ) => {
    setPopupInfo({ type: 'overlap', tasks, center })
  }

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
        onClick={(e: MapMouseEvent) => {
          handleMapClick(e)
        }}
        onMouseMove={handleMapMouseMove}
        interactiveLayerIds={
          shouldCluster && clusterLayer.id
            ? [clusterLayer.id, LAYER_IDS.clusterCount, LAYER_IDS.points]
            : [LAYER_IDS.points]
        }
      >
        {shouldCluster ? (
          <ClusterSource geoJSONData={geoJSONData} showBundleOnly={showBundleOnly} />
        ) : (
          <UnclusteredSource
            geoJSONData={geoJSONData}
            showBundleOnly={showBundleOnly}
            primaryTaskId={primaryTaskId}
            activeBundle={activeBundle}
            mapRef={mapRef}
          />
        )}

        <TaskGeometryLayer
          popupInfo={popupInfo}
          primaryTaskId={primaryTaskId}
          activeBundle={activeBundle}
        />

        <MapPopups
          popupInfo={popupInfo}
          onClose={() => {
            setPopupInfo(null)
          }}
          mapRef={mapRef}
          onOverlapTaskSelect={handleOverlapTaskSelect}
          showBundleButtons={true}
          activeBundle={activeBundle}
          primaryTaskId={primaryTaskId}
          onAddToBundle={handleAddToBundle}
          onRemoveFromBundle={handleRemoveFromBundle}
          bundleEditsDisabled={bundleEditsDisabled}
        />
      </MapGL>

      <LoadingIndicator isLoading={isLoadingMarkers} />

      <MapControls
        map={mapRef}
        mapLoaded={mapLoaded}
        showZoom={true}
        showReset={true}
        showLayers={true}
        collapsible={true}
        defaultOpen={true}
        onLayersClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
        StyleSwitcherPanel={MapStyleSwitcher}
        styleSwitcherPanelProps={{
          map: mapRef,
          mapLoaded,
          isOpen: isStylePanelOpen,
          onClose: () => setIsStylePanelOpen(false),
        }}
      />

      <ClusterToggle
        clusteringEnabled={shouldCluster}
        onToggle={setCluster}
        taskCount={taskCount}
        showWarnings={false}
      />

      <BundleFilterToggle />
    </div>
  )
}
