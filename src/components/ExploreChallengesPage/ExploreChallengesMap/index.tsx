import type maplibregl from 'maplibre-gl'
import {
  FullscreenControl,
  GeolocateControl,
  Map as MapGL,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from './MapControls'
import { LoadingIndicator } from './LoadingIndicator'
import { MapPopups } from './MapPopups'
import { MarkerPins } from './MarkerPins'
import { useExploreChallengesMap } from './hooks'

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
  } = useExploreChallengesMap()

  const handleSingleMarkerClick = (task: typeof markersData.markers[0]) => {
    setPopupInfo({ type: 'single', task })
  }

  const handleOverlapMarkerClick = (
    tasks: typeof markersData.markers[0][],
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
        onClick={(e) => {
          handleMapClick(e as maplibregl.MapMouseEvent)
        }}
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl position="bottom-left" />

        <MarkerPins
          shouldCluster={shouldCluster}
          nonOverlapping={overlapData.nonOverlapping}
          overlaps={overlapData.overlaps}
          onSingleMarkerClick={handleSingleMarkerClick}
          onOverlapMarkerClick={handleOverlapMarkerClick}
        />

        <MapPopups popupInfo={popupInfo} onClose={() => setPopupInfo(null)} />
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

