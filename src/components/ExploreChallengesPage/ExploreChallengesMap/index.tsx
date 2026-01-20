import {
    FullscreenControl,
    GeolocateControl,
    Map as MapGL,
    NavigationControl,
    ScaleControl,
    Source,
    Layer,
} from 'react-map-gl/maplibre'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LAYER_IDS, CLUSTER_CONFIG } from '@/components/shared/TaskMarkers/const'
import {
    useExploreChallengesMap,
    clusterLayer,
    clusterCountLayer,
    unclusteredPointLayer,
} from './hooks'
import { LoadingIndicator } from './LoadingIndicator'
import { MapControls } from './MapControls'
import { MapPopups } from './MapPopups'
import { MarkerPins } from './MarkerPins'

export const ExploreChallengesMap = () => {
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
    handleMapMoveEnd,
    handleMapClick,
    setCluster,
    geoJSONData,
  } = useExploreChallengesMap()

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
        initialViewState={{
          longitude: 0,
          latitude: 0,
          zoom: 2,
        }}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
        onMoveEnd={handleMapMoveEnd}
        onClick={(e: MapMouseEvent) => {
          handleMapClick(e)
        }}
        interactiveLayerIds={shouldCluster && clusterLayer.id ? [clusterLayer.id] : undefined}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl position="bottom-left" />

        {shouldCluster && (
          <Source
            id={LAYER_IDS.source}
            type="geojson"
            data={geoJSONData}
            cluster={false}
            clusterMaxZoom={CLUSTER_CONFIG.maxZoom}
            clusterRadius={CLUSTER_CONFIG.radius}
          >
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        )}

        <MarkerPins
          shouldCluster={shouldCluster}
          nonOverlapping={overlapData.nonOverlapping}
          overlaps={overlapData.overlaps}
          onSingleMarkerClick={handleSingleMarkerClick}
          onOverlapMarkerClick={handleOverlapMarkerClick}
        />

        <MapPopups popupInfo={popupInfo} onClose={() => setPopupInfo(null)} mapRef={mapRef} />
      </MapGL>

      <LoadingIndicator isLoading={isLoadingMarkers} />

      <MapControls
        mapRef={mapRef}
        mapLoaded={mapLoaded}
        isStylePanelOpen={isStylePanelOpen}
        setIsStylePanelOpen={setIsStylePanelOpen}
        shouldCluster={shouldCluster}
        onToggleCluster={setCluster}
        taskCount={taskCount}
      />
    </div>
  )
}
