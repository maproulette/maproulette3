# ChallengeCard

**Source**: `src/components/shared/ChallengeCard.tsx`

A clickable card with two variants controlled by a `variant` prop:

- **`challenge`** (default) — Displays a challenge's name, parent project, tasks remaining, completion progress bar, difficulty badge, and last updated date. Links to the challenge's browse page.
- **`project`** — Displays a project's name, `challengeMeta` stats (total challenges, pinned, completed), a progress bar based on completion ratio, and last updated date. Links to the project's browse page. Uses filler data when `challengeMeta` is not provided.

Both variants share the same card layout: subtitle at top, title + action items + color indicator image area, progress bar, and bottom metadata row. A colored indicator square shows completion status (red < 25%, yellow 25-50%, orange 50-90%, blue 90%+).

An optional `actions` slot renders action buttons (pin, visibility toggle, overflow menu) above the image area.

**Used in**: Explore Challenges, Browse Project, Manage Project Detail.
