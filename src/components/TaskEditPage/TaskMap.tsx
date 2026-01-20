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
import { MarkerPins } from './TaskMap/MarkerPins'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'

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

  // Fetch primary task data for bundle
  const { data: primaryTaskData } = useQuery(api.task.getTask(primaryTaskId))

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 2,
  }

  const handleAddToBundle = (taskId: number) => {
    if (bundleEditsDisabled) return

    // Find task in markers data
    const taskToAddMarker = markersData.markers.find((m) => m.id === taskId)
    if (!taskToAddMarker) {
      console.error('Task not found in markers data')
      return
    }

    if (!activeBundle) {
      // Create new bundle locally with primary task and this task
      const primaryTask = (primaryTaskData as Task | undefined) || task
      const newBundle = {
        bundleId: 0, // Temporary ID, will be set on submit
        taskIds: [primaryTaskId, taskId],
        tasks: [primaryTask].filter(Boolean), // We'll fetch full task data on submit if needed
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
      // Set initial bundle to null since this is a new bundle
      setInitialBundle(null)
    } else {
      // Add task to existing bundle
      if (activeBundle.taskIds.includes(taskId)) {
        return // Task already in bundle
      }

      const updatedTaskIds = [...activeBundle.taskIds, taskId]

      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        // Keep existing tasks array, we don't need to fetch full task data for local state
        tasks: activeBundle.tasks,
      })
    }
  }

  const handleRemoveFromBundle = (taskId: number) => {
    if (!activeBundle || bundleEditsDisabled) return

    if (taskId === primaryTaskId) {
      return // Cannot remove primary task
    }

    if (!activeBundle.taskIds.includes(taskId)) {
      return // Task not in bundle
    }

    const updatedTasks = (activeBundle.tasks || []).filter((t) => t.id !== taskId)
    const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== taskId)

    // If removing this task would leave only 1 task, clear the bundle locally
    if (updatedTaskIds.length <= 1) {
      clearBundle()
      return
    }

    // Update bundle locally
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

  const handleSingleMarkerClick = (task: (typeof markersData.markers)[0]) => {
    setPopupInfo({ type: 'single', task })
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
            : undefined
        }
      >
        {shouldCluster && <ClusterSource geoJSONData={geoJSONData} showBundleOnly={showBundleOnly} />}

        <MarkerPins
          shouldCluster={shouldCluster}
          nonOverlapping={overlapData.nonOverlapping}
          overlaps={overlapData.overlaps}
          primaryTaskId={primaryTaskId}
          onSingleMarkerClick={handleSingleMarkerClick}
          onOverlapMarkerClick={handleOverlapMarkerClick}
          activeBundle={activeBundle}
        />

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
