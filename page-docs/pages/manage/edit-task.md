# Edit Task (`/manage/task/$taskId/edit`)

**Source**: `src/components/shared/TaskForm.tsx`

Form for editing a task. Wrapped in ManageFormLayout.

**Fields**: Name, instructions (overrides challenge instructions), GeoJSON geometry, status dropdown, and MR tags (comma-separated). Uses Zod validation.

Task creation (`/manage/task/new`) is currently a placeholder — tasks are typically created in bulk through challenges.
