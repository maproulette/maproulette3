# Manage Challenge Detail (`/manage/challenge/$challengeId`)

**Source**: `src/components/ManagementPages/ManageChallengeDetail/`

Detail view for a single managed challenge. A breadcrumb-style header shows the full route path (`/manage/projects/{project name}.../challenges/{challenge name}...`) with truncation for long names. Below the header is a two-column layout with a detail panel on the left and a map/table on the right.

## Sections

### Detail Panel

The left panel has three collapsible sections:

- **General** — Challenge name, status, difficulty, featured badge, blurb, ID, and quick action buttons (browse, edit).
- **Description** — Full challenge description and instructions.
- **Metrics** — Task activity breakdown showing counts per status (available, fixed, false positive, skipped, etc.), tasks remaining, and completion percentage.

### Task Map/Table

The right panel displays challenge tasks in either a map view or a table view. Filters allow narrowing by task status, priority, or other criteria. Includes a ChallengeStatusIndicator that shows build progress, errors, or deletion state when tasks are being rebuilt.

## Future

### Task Bulk Actions

Add bulk action controls to the table view so challenge owners can select multiple tasks and change their status, priority, or assignment in batch.

### Export Tasks

Add an export button to download the filtered task list as CSV or GeoJSON for offline analysis or sharing.
