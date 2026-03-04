# Task Page (`/tasks/$taskId`)

**Source**: `src/components/TaskEditPage/`

The main task editing interface where users actually complete mapping work. A resizable split layout with a task info panel on the left (~30%) and an interactive map on the right (~70%).

## Sections

### Task Panel

The left panel displays the task header (ID, status, lock state) with links to the parent challenge and project. Below is a tabbed interface:

- **Task Info** — Challenge instructions, bundled task list, and add/remove bundle controls
- **Properties** — Key-value pairs from the task's GeoJSON features
- **Comments & History** — Timeline of comments and status changes, with an input to add new comments
- **OSM History** — Changeset history for the task's OSM features
- **Location** — Coordinates with copy button and changeset link

At the bottom, a fixed action footer shows context-dependent buttons: "Sign in" if not authenticated, "Map this task" if not locked, completion buttons (Fixed, Already Fixed, Not an Issue, Can't Complete) when locked, or "Nearby/Random task" navigation when already completed.

### Task Map

The right panel shows the task geometry on a MapLibre GL map with nearby task markers. Markers cluster and expand into spider layouts for overlapping tasks. Clicking a marker opens its details in a drawer overlay on the left panel.

A multi-task panel in the top-left enables bundling — users can draw a lasso to select multiple nearby tasks to work on together (up to 50). Bundle controls allow adding, removing, resetting, and clearing bundled tasks.

### Editor Integration

A split button launches the user's preferred external editor (iD, JOSM, JOSM New Layer, Level0, JOSM Features Only, or Rapid) centered on the task location. The default editor is saved to the user's account.

### Task Completion

Clicking a completion button opens a modal where the user can set the status, add an optional comment and tags, and choose whether to navigate to a random or nearby task next. An embedded map preview shows nearby tasks for selection.

### Keyboard Shortcuts

`?` help, `H` toggle markers, `F` filter to bundle, `D` draw lasso, `Delete` clear bundle, `ESC` cancel drawing, `Ctrl+F` mark fixed, `Ctrl+P` mark false positive.

## Future

### OSM Data Layer

Add a toggleable OSM data layer on the task map so users can see surrounding OpenStreetMap features for context while editing.

### Mapillary Data Layer

Add a toggleable Mapillary street-level imagery layer so users can reference real-world photos when completing tasks.

### iD Editor Iframe

Embed the iD editor directly over the map as an iframe instead of opening it in a new tab, allowing users to edit OSM data without leaving the task page.
