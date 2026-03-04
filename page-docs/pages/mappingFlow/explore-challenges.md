# Explore Challenges (`/`)

**Source**: `src/components/ExploreChallengesPage/`

The landing page where users discover and browse available challenges. Shows a filterable list of challenges alongside an interactive map.

## Sections

### Filter Bar

A horizontal bar of controls for narrowing down challenges: location search (Nominatim autocomplete), sort order (name, newest, oldest, popular, difficulty), work-on category (roads, water, POIs, buildings, land use, transit), difficulty level (easy, normal, expert), custom keyword categories, and a global/local toggle. A view mode toggle switches between grid, list, and grid-map layouts. Filters persist across sessions via cookies and URL params.

### Challenge List

Displays matching challenges as cards (grid/grid-map mode) or rows (list mode). Grid-map mode shows the list in a resizable left panel alongside the map. List mode shows a table with columns for name, author, completion stats, difficulty, status, and more. Supports infinite scroll with a "Load More" button.

### Map

An interactive MapLibre GL map showing task markers for the visible challenges. Markers cluster when zoomed out, expand into spider layouts when overlapping, and open a task info drawer when clicked. The map filters update as the user pans/zooms. A location search can highlight a region with a polygon overlay.

## Future

### Virtual Challenge Lasso

Add the ability to draw a lasso on the explore map to select tasks across challenges and create a virtual challenge from the selection.

### Vector Tile Index Management

Improve how the vector tile index is built, updated, and queried to ensure map markers stay accurate and performant as challenges and tasks change.
