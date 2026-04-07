import { Maximize2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/Map/MapControls'
import { MapStyleSwitcher } from '@/components/Map/MapStyleSwitcher'
import { ClusterToggle } from '@/components/Map/TaskMarkers/ClusterSlider'
import { ClusterSource } from '@/components/Map/TaskMarkers/ClusterSource'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { SpiderMarkers } from '@/components/Map/TaskMarkers/SpiderMarkers'
import { TaskGeometryLayer } from '@/components/Map/TaskMarkers/TaskGeometryLayer'
import { MapLoadingIndicator } from '@/components/shared/MapLoadingIndicator'
import { useDrawerPortal } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { TaskInfoDrawer } from '@/components/TaskInfoPanel/TaskInfoDrawer'
import { clusterLayer, useBrowseChallengeMap } from './BrowseChallengeMap/hooks'

export const BrowseChallengeMap = () => {
  const {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    selectedTask,
    setSelectedTask,
    defaultStyle,
    shouldCluster,
    markersData,
    isLoadingMarkers,
    handleMapClick,
    handleMapMouseMove,
    handleMapMoveEnd,
    setCluster,
    clusteredGeoJSONData,
    zoomToAllTags,
    hasAllTagsBounds,
    spideredMarkers,
    setSpideredMarkers,
  } = useBrowseChallengeMap()

  const { portalTarget } = useDrawerPortal()

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 0,
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
        onMoveEnd={handleMapMoveEnd}
        interactiveLayerIds={
          shouldCluster && clusterLayer.id
            ? [clusterLayer.id, LAYER_IDS.clusterCount, LAYER_IDS.points, 'spidered-markers-layer']
            : [LAYER_IDS.points, 'spidered-markers-layer']
        }
      >
        <ClusterSource clusteredData={clusteredGeoJSONData} />

        <TaskGeometryLayer selectedTaskId={selectedTask?.id ?? null} />

        {spideredMarkers.size > 0 && (
          <SpiderMarkers
            markers={markersData.markers.filter((m) => spideredMarkers.has(m.id))}
            spiderPositions={spideredMarkers}
            selectedTaskId={selectedTask?.id}
          />
        )}
      </MapGL>

      {portalTarget &&
        createPortal(
          <TaskInfoDrawer
            selectedTask={selectedTask}
            onClose={() => {
              setSelectedTask(null)
              setSpideredMarkers(new Map())
            }}
            mapRef={mapRef}
          />,
          portalTarget
        )}

      <MapLoadingIndicator isLoading={isLoadingMarkers} />

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
        customButtons={
          hasAllTagsBounds
            ? [
                {
                  icon: Maximize2,
                  onClick: zoomToAllTags,
                  tooltip: 'Zoom out to all tags',
                  disabled: !mapLoaded,
                },
              ]
            : []
        }
      />

      <ClusterToggle isClustered={shouldCluster} onChange={setCluster} />
    </div>
  )
}
