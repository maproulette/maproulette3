# Edit / Create Project

**Source**: `src/components/shared/ProjectForm.tsx`

Form for creating (`/manage/project/new`) or editing (`/manage/project/$projectId/edit`) a project. Wrapped in ManageFormLayout with a back link and header.

**Fields**: Project name (unique identifier), display name, description, enabled toggle, and featured toggle. Uses Zod validation.
