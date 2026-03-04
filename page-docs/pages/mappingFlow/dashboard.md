# Dashboard (`/dashboard`)

**Source**: `src/components/DashboardPage/`

A page that shows the user's profile, level, metadata, saved challenges, locked tasks, their teams, and their contributions. Requires authentication.

## Sections

### User Profile

Displays the user's avatar, display name, OSM verification status, and account age. Shows their current level and a progress bar toward the next level. Clicking the level opens a modal explaining all milestone levels and the leveling formula (`Level = √(Points / 10)`).

### Saved Challenges

A list of challenges the user has bookmarked (up to 10). Each entry shows the challenge name, tasks remaining, and a completion progress bar. Clicking a challenge navigates to its browse page.

### Locked Tasks

Shows tasks the user is currently working on (has locked). Each entry displays the task ID, parent challenge name, and how long ago it was locked. Clicking navigates to the task page. Super users also see a manage link.

### Teams

A list of the user's teams with their membership status (Invited, Member, or Admin).

### Contributions

A timeline of task actions the user has performed, grouped by date and challenge. Shows counts per status (Fixed, Not an Issue, Skipped, Already Fixed, Too Hard). Serves as an entry point to revisit recent challenges they've worked on.
