# MapRoulette Page Documentation

## Mapping Flow

The core user journey — finding challenges, browsing them, and completing tasks.

- [Dashboard](pages/mappingFlow/dashboard.md)
- [Explore Challenges](pages/mappingFlow/explore-challenges.md)
- [Browse Challenge](pages/mappingFlow/browse-challenge.md)
- [Browse Project](pages/mappingFlow/browse-project.md)
- [Task Page](pages/mappingFlow/task-page.md)

## Manage

Pages for creating and managing projects, challenges, and tasks.

- [Manage Home](pages/manage/index.md)
- [Projects](pages/manage/projects.md)
- [Project Detail](pages/manage/project-detail.md)
- [Edit / Create Project](pages/manage/edit-project.md)
- [Challenges](pages/manage/challenges.md)
- [Challenge Detail](pages/manage/challenge-detail.md)
- [Edit / Create Challenge](pages/manage/edit-challenge.md)
- [Tasks](pages/manage/tasks.md)
- [Task Detail](pages/manage/task-detail.md)
- [Edit Task](pages/manage/edit-task.md)

## Other

- [Profile](pages/other/profile.md)
- [Settings](pages/other/settings.md)
- [Notifications](pages/other/notifications.md)
- [Super Admin](pages/other/super-admin.md)

## Shared Components

- [Global Search](components/global-search.md)
- [ChallengeCard](components/challenge-card.md)
- [SearchBar](components/search-bar.md)
- [PageHeader](components/page-header.md)
- [StatusBadge](components/status-badge.md)
- [EntityGrid](components/entity-grid.md)
- [Map Components](components/map-components.md)
- [Auth Guards](components/auth-guards.md)
- [Layout Components](components/layout-components.md)
- [Loading States](components/loading-states.md)
- [UI Primitives](components/ui-primitives.md)

## Route Structure

```
/                               # Explore Challenges
/dashboard                      # Dashboard
/challenge/$challengeId         # Browse Challenge
/project/$projectId             # Browse Project
/tasks/$taskId                  # Task Page
/profile                        # Profile
/settings                       # Settings
/notifications                  # Notifications
/manage/                        # Manage Home
├── projects                    # Projects list
├── challenges                  # Challenges list
├── tasks                       # Task lookup (super-user)
├── project/new                 # Create Project
├── project/$projectId          # Project Detail
├── project/$projectId/edit     # Edit Project
├── challenge/new               # Create Challenge
├── challenge/$challengeId      # Challenge Detail
├── challenge/$challengeId/edit # Edit Challenge
├── task/$taskId                # Task Detail
└── task/$taskId/edit           # Edit Task
/super-admin/                   # Super Admin Home
├── users                       # User Management
├── projects                    # All Projects
├── challenges                  # All Challenges
├── analytics                   # Analytics
├── plugins                     # Plugins
└── settings                    # Platform Settings
```
