# Browse Challenge (`/challenge/$challengeId`)

**Source**: `src/components/BrowsedChallengePage/`

The detail page for a single challenge. Shows challenge information on the left and a task map on the right in a resizable split layout. This is where users learn about a challenge and start working on it.

## Sections

### Challenge Panel

Displays the challenge title, taxonomy badges (Featured, Popular, Newest, etc.), description (markdown), and blurb. Users can like, comment, save/bookmark, and share the challenge. A more-actions menu offers Overpass Query viewing, cloning, and reporting.

The footer shows a segmented progress bar breaking down task statuses (fixed, skipped, false positive, etc.) with a completion percentage. A "Start Challenge" button loads a random task and navigates to the task page.

If the challenge has been reported, a warning alert links to the GitHub issue.

### Challenge Map

An interactive map showing all task locations for this challenge. Markers are clustered by default and can be expanded. Clicking a marker opens a task info drawer. Controls include zoom, map style switching, and a cluster toggle.

## Future

### Virtual Challenge Lasso

Add the ability to draw a lasso on the challenge map to select a subset of tasks and create a virtual challenge from them. This would let users scope down a large challenge to a specific area of interest before starting work.

### Mustache Tags & Images in Instructions

Support mustache template tags in challenge instructions so dynamic task-specific data can be injected into the instruction text. Also support embedded images in instructions.

### Challenge Header Image

Display the challenge's image in the header section if one is available.
