# Edit / Create Challenge

**Source**: `src/components/shared/ChallengeForm.tsx`

Form for creating (`/manage/challenge/new`) or editing (`/manage/challenge/$challengeId/edit`) a challenge. Wrapped in ManageFormLayout. Create accepts an optional `?projectId=` param to pre-select the project.

**Fields**: Project selector, challenge name, blurb, description, instructions, difficulty, enabled toggle, featured toggle, and task data source.

The task data source is a radio group with three options: Overpass Query (textarea for Overpass QL), Upload GeoJSON (file input), or Remote GeoJSON (URL input). Uses Zod validation.
