# Map Components

Shared components for interactive MapLibre GL maps.

## MapControls (`src/components/shared/MapControls.tsx`)

A floating vertical toolbar for map interaction — zoom in/out, reset view, and layers toggle. Supports custom buttons (e.g., center to task, hide markers, bundle filter on the task page). Collapsible on mobile with tooltips on hover.

## MapStyleSwitcher (`src/components/shared/MapStyleSwitcher.tsx`)

A dropdown panel for switching map tile styles. Shows a scrollable list of available styles with preview thumbnails, highlighting the currently selected one.

## ClusterSource (`src/components/shared/TaskMarkers/ClusterSource.tsx`)

Renders clustered task markers on the map using a GeoJSON source. Creates three layers: cluster circles, count labels, and individual unclustered point markers with status-based icons.

## SpiderMarkers (`src/components/shared/TaskMarkers/SpiderMarkers.tsx`)

Handles overlapping task markers by arranging them in a radial spider layout around their shared position, connected by colored lines. Supports highlighting for primary tasks, bundles, and selections.

## TaskGeometryLayer (`src/components/TaskEditPage/TaskMap/TaskGeometryLayer.tsx`)

Renders task GeoJSON geometry (polygons, lines, points) on the map with indigo fill/stroke, switching to purple when selected.

## TaskInfoDrawer (`src/components/shared/TaskMarkers/TaskInfoDrawer.tsx`)

A bottom drawer that appears when a task marker is clicked on the Explore Challenges or Browse Challenge maps. Shows the task's ID, status, and tabbed content (info, properties, comments, OSM history) with a link to open the full task page.

## TaskPin / OverlapTaskPin

SVG marker icons for individual tasks (color-coded by status with difficulty letter) and overlap groups (dark blue with count).
