import React, { useEffect, useRef, useState } from 'react';
import { Marker, Tooltip, Polyline, useMap } from 'react-leaflet';
import _map from 'lodash/map';
import _isEqual from 'lodash/isEqual';
import _each from 'lodash/each';
import _filter from 'lodash/filter';
import _reject from 'lodash/reject';
import _compact from 'lodash/compact';
import _isEmpty from 'lodash/isEmpty';
import _omit from 'lodash/omit';
import _cloneDeep from 'lodash/cloneDeep';
import _isObject from 'lodash/isObject';
import './TaskClusterMap.scss';
import { toLatLngBounds } from '../../services/MapBounds/MapBounds';
import bbox from '@turf/bbox';
import AsMappableTask from '../../interactions/Task/AsMappableTask';
import AsSpiderableMarkers from '../../interactions/TaskCluster/AsSpiderableMarkers';
import AsMappableCluster from '../../interactions/TaskCluster/AsMappableCluster';
import AsColoredHashable from '../../interactions/Hashable/AsColoredHashable';
import distance from '@turf/distance';
import bboxPolygon from '@turf/bbox-polygon';
import { geometryCollection } from '@turf/helpers';
import centroid from '@turf/centroid';

export const CLUSTER_POINTS = 25;
export const CLUSTER_ICON_PIXELS = 40;
export const UNCLUSTER_THRESHOLD = 1000;

export const labelOverlappingMarkers = (markers) => {
  const uniqueCoords = {};

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const stringCoords = marker.position.join(',');
    const count = uniqueCoords[stringCoords];

    if (count) {
      uniqueCoords[stringCoords]++;
    } else {
      uniqueCoords[stringCoords] = 1;
    }
  }

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const stringCoords = marker.position.join(',');
    const count = uniqueCoords[stringCoords];

    marker.overlappingCount = count;
  }

  return markers;
};

const Markers = (props) => {
  const map = useMap();
  const [mapMarkers, setMapMarkers] = useState([]);
  const [currentSize, setCurrentSize] = useState(map.getSize());
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [spidered, setSpidered] = useState(new Map());
  const timerRef = useRef(null);
  const prevProps = useRef({ ...props });

  useEffect(() => {
    const executeCode = async () => {
      const bounds = map.getBounds();
      setCurrentSize(map.getSize());
      props.setCurrentZoom(map.getZoom());
      props.setCurrentBounds(bounds);
      await props.updateBounds(bounds, props.currentZoom);
    };

    const handleMapMove = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        await executeCode();
      }, 500);
    };

    map.on('moveend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [map, props.currentZoom, props.updateBounds]);

  useEffect(() => {
    if (!props.taskMarkers || props.delayMapLoad || !_isEqual(props.taskMarkers, prevProps.current.taskMarkers) || props.selectedClusters !== prevProps.current.selectedClusters) {
      refreshSpidered();
      generateMarkers();
    } else if (!_isEqual(spidered, prevProps.current.spidered)) {
      generateMarkers();
    }
    prevProps.current = { ...props, spidered: spidered };
  }, [props.taskMarkers, spidered]);

  useEffect(() => {
    setSpidered(new Map());
    prevProps.current = { ...props, spidered: spidered };
  }, [props.currentZoom]);

  useEffect(() => {
    // Fit bounds to initial tasks when they are loaded
    if (!initialLoadComplete && mapMarkers && mapMarkers.length > 0) {
      const bounds = toLatLngBounds(
        bbox({
          type: 'FeatureCollection',
          features: _map(mapMarkers, cluster =>
            ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [cluster.props.position[1], cluster.props.position[0]]
              }
            })
          )
        })
      );
      map.fitBounds(bounds);
      props.setCurrentBounds(bounds);
      setInitialLoadComplete(true);
    }
  }, [mapMarkers, initialLoadComplete]);

  const refreshSpidered = () => {
    if (spidered.size === 0) {
      return;
    }

    const refreshed = new Map();
    _each(props.taskMarkers, (marker) => {
      if (spidered.has(marker.options.taskId)) {
        refreshed.set(marker.options.taskId, { ...spidered.get(marker.options.taskId), icon: marker.icon });
      }
    });

    setSpidered(refreshed);
  };

  const markerDistanceDegrees = (first, second) => {
    const firstPosition = [first.options.point.lng, first.options.point.lat];
    const secondPosition = [second.options.point.lng, second.options.point.lat];
    return distance(firstPosition, secondPosition, { units: 'degrees' });
  };

  const mapMetricsInDegrees = (iconSize = CLUSTER_ICON_PIXELS + 20) => {
    const metrics = {}
    metrics.heightDegrees = props.currentBounds.getNorth() - props.currentBounds.getSouth()
    metrics.widthDegrees = props.currentBounds.getEast() - props.currentBounds.getWest()
    metrics.degreesPerPixel = metrics.heightDegrees / currentSize.y
    metrics.iconSizeDegrees = iconSize * metrics.degreesPerPixel

    return metrics
  }

  const overlappingTasks = (marker, allMarkers) => {
    const { iconSizeDegrees } = mapMetricsInDegrees(CLUSTER_ICON_PIXELS);
    const overlapping = _filter(allMarkers, (otherMarker) => {
      if (otherMarker === marker) return false;
      const dist = markerDistanceDegrees(marker, otherMarker);
      return dist <= iconSizeDegrees / 2;
    });
    return overlapping;
  };

  const spiderIfNeeded = (marker, allMarkers) => {
    if (spidered.has(marker.options.taskId)) {
      return;
    }

    const overlapping = overlappingTasks(marker, allMarkers);
    if (overlapping && overlapping.length > 0) {
      overlapping.push(marker);
      spider(marker, overlapping);
    } else if (spidered.size > 0) {
      setSpidered(new Map());
    }
  };

  const spider = (clickedMarker, overlappingMarkers) => {
    const centerPointPx = map.latLngToLayerPoint(clickedMarker.position);
    const updateSpidered = AsSpiderableMarkers(overlappingMarkers).spider(centerPointPx, CLUSTER_ICON_PIXELS);
    _each([...updateSpidered.values()], (s) => (s.position = map.layerPointToLatLng(s.positionPx)));
    setSpidered(updateSpidered);
  };

  const consolidateMarkers = markers => {
    if (!(props.showAsClusters && props.totalTaskCount > CLUSTER_POINTS && markers && props.currentBounds && currentSize)) {
      return markers;
    }

    const { heightDegrees, widthDegrees, iconSizeDegrees } = mapMetricsInDegrees();
    const maxClusterSize = Math.max(heightDegrees, widthDegrees) / 4.0;
    const combinedClusters = new Map();
  
    for (let i = 0; i < markers.length - 1; i++) {
      let currentCluster = markers[i];
  
      if (_isEmpty(currentCluster.options.bounding) || combinedClusters.has(currentCluster.options.clusterId)) {
        continue;
      }
  
      for (let j = i + 1; j < markers.length; j++) {
        if (combinedClusters.has(markers[j].options.clusterId) || _isEmpty(markers[j].options.bounding)) {
          continue;
        }

        try {
          if (markerDistanceDegrees(currentCluster, markers[j]) <= iconSizeDegrees) {
            const combinedBounds = bbox(geometryCollection([currentCluster.options.bounding, markers[j].options.bounding]));

            if (combinedBounds[3] - combinedBounds[1] > maxClusterSize || combinedBounds[2] - combinedBounds[0] > maxClusterSize) {
              continue;
            }

            currentCluster = _omit(_cloneDeep(currentCluster), ['options.taskId', 'options.taskStatus', 'options.taskPriority']);
            currentCluster.options.bounding = bboxPolygon(combinedBounds).geometry;
            currentCluster.options.numberOfPoints += markers[j].options.numberOfPoints;

            const centerpoint = centroid(currentCluster.options.bounding);
            currentCluster.options.point = { lat: centerpoint.geometry.coordinates[1], lng: centerpoint.geometry.coordinates[0] };
            currentCluster.position = [currentCluster.options.point.lat, currentCluster.options.point.lng];

            currentCluster.icon = AsMappableCluster(currentCluster).leafletMarkerIcon(props.monochromaticClusters, null, false, props.selectedClusters);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    const finalClusters = _compact(_map(markers, (marker) => {
      if (!combinedClusters.has(marker.options.clusterId)) {
        return marker;
      }
  
      return _isObject(combinedClusters.get(marker.options.clusterId)) ? combinedClusters.get(marker.options.clusterId) : null;
    }));
  
    return finalClusters;
  };

  /**
   * Invoked when an individual task marker is clicked by the user.
   */
  const markerClicked = async (marker) => {
    if (!props.loadingChallenge) {
      if (marker.options.bounding && marker.options.numberOfPoints > 1) {
        const bounds = toLatLngBounds(bbox(marker.options.bounding));
        map.fitBounds(bounds);
        props.setCurrentBounds(bounds);
      }
    }
  };

  const generateMarkers = () => {
    let consolidatedMarkers = consolidateMarkers(props.taskMarkers);

    if (spidered.size > 0) {
      consolidatedMarkers = _reject(consolidatedMarkers, (m) => spidered.has(m.options.taskId));
      consolidatedMarkers.push(...[...spidered.values()]);
    }

    const uniqueCoords = {};

    const markers = _map(consolidatedMarkers, (mark) => {
      let onClick = null;
      let popup = null;
      const taskId = mark.options.taskId || mark.options.id;
      let position = mark.position;

      if (taskId) {
        if (props.showMarkerPopup) {
          popup = props.showMarkerPopup(mark);
        }

        if (props.allowSpidering) {
          onClick = () => spiderIfNeeded(mark, consolidatedMarkers);
        }
      } else {
        onClick = () => markerClicked(mark);
      }

      const markerId = taskId
        ? `marker-task-${taskId}`
        : `marker-cluster-${mark.options.point.lat}-${mark.options.point.lng}-${mark.options.numberOfPoints}`;

      if (taskId && !spidered.has(taskId)) {
        const nearestToCenter = AsMappableTask(mark.options).nearestPointToCenter();
        if (nearestToCenter) {
          position = [nearestToCenter.geometry.coordinates[1], nearestToCenter.geometry.coordinates[0]];
        }
      }

      const overlappingMark =
        !mark.options.clusterId && mark.overlappingCount > 1 && !spidered.has(mark.options.taskId);

      if (overlappingMark) {
        const stringCoords = mark.position.join(',');

        if (!uniqueCoords[stringCoords]) {
          uniqueCoords[stringCoords] = true;

          return (
            <Marker
              key={markerId}
              position={position}
              eventHandlers={{
                click: () => {
                  if (onClick) {
                    onClick();
                  }
                },
              }}
            >
              <Tooltip>{mark.overlappingCount} overlapping tasks</Tooltip>
            </Marker>
          );
        } else {
          return (
            <Marker
              key={markerId}
              taskId={mark?.options?.id}
              zIndexOffset={-100}
              opacity={0}
              position={position}
            ></Marker>
          );
        }
      }

      if (mark.icon) {
        return (
          <Marker
            key={markerId}
            position={position}
            icon={mark.icon}
            eventHandlers={{
              click: () => {
                if (onClick) {
                  onClick();
                }
              },
            }}
          >
            {popup}
          </Marker>
        );
      } else {
        return (
          <Marker
            key={markerId}
            position={position}
            eventHandlers={{
              click: () => {
                if (onClick) {
                  onClick();
                }
              },
            }}
          >
            {popup}
          </Marker>
        );
      }
    });

    setMapMarkers(markers);
  };

  return (
    <>
      {[...spidered.values()].map((s) => (
        <Polyline
          key={s.options.id}
          positions={[s.originalPosition, s.position]}
          color={AsColoredHashable(s.options.id).hashColor}
          weight={3}
          spideredId={s.options.id}
          style={{padding: "30px" }}
          eventHandlers={{
            click: () => {
              setSpidered(new Map());
            },
          }}
        />
      ))}
      {!props.mapZoomedOut && mapMarkers}
    </>
  );
};

export default Markers;
