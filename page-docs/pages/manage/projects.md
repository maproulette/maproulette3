# Manage Projects (`/manage/projects`)

**Source**: `src/components/ManagementPages/ManageProjects/`

A paginated list of the user's projects with search, filters, and grid/list view modes. Users can filter by enabled/disabled status, owned only, archived, and pinned.

Each project card shows the name, ID, description, status badge, challenge count, and a scrollable list of its challenges. A dropdown menu on each card provides actions: view, edit, add challenge, export CSV, copy URL, archive/unarchive, and delete.

Challenge items within a card can be pinned, and have their own dropdown with actions like start, view, edit, move to another project, clone, archive, rebuild tasks, enable/disable, and delete.

A "Create New Project" button links to the project creation form.
