# Changelog
All notable changes to this project will be documented in this file.

The format is based on
[Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

This project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [v3.00-beta.1] - 2018-03-12
### Added
- Option to clone challenge for challenge owners (#84).
- Saving indicator for user settings (#154).
- Option to contact challenge owner when completing a task (#71).
- Support for OpenCycleMap API key.
- Support for asynchronous challenge deletion (#108).
- Task priority filtering for challenge owners.
- Task priority column in task list table for challenge owners.

### Changed
- Reorganized project management for challenge owners.
- Switched charting libraries.
- Updated content to reflect initial beta release (#153). 
- Limit task clustering to max of 15,000 tasks.

### Fixed
- Bing layer no longer blank at high zoom (#76).
- Honor project visibility on challenge search.


## [v3.00-alpha.7] - 2018-03-05
### Added
- Localization and partial translations for fr, es, de, and af locales derived
  from existing translations in MR2 project (#136).
- User settings for locale, default editor, and custom basemap on the
  User Profile page (#83).
- Experimental support (disabled by default) for map-bounded task browsing and
  creation of virtual challenges (#135).
- Display challenge last-modified timestamp to challenge owners (#142).
- Offer edit and modify controls in task-review mode (#139).

### Changed
- Update styling on View Challenge page for challenge owners.
- Change label of Fix button to "Edit" (#140).
- Other minor styling and labeling updates.

### Fixed
- Honor challenge and user custom basemaps (#144).


## [v3.00-alpha.6] - 2018-02-26
### Added
- Visual priority-rule builder for tasks when creating/editing challenges.
- Support for overpass turbo `@id` feature property when editing tasks.
- Live preview of Markdown content during editing.
- Restoration of challenge-owner map state when returning to it (#123).
- Option for challenge-owners to export challenge comments as CSV.

### Changed
- Users can comment on a task regardless of task status (#113).
- Ignore unclustering setting on challenge-owner map and always cluster tasks
  if more than 1000 tasks would be visible.
- Unclustering option only shown when at most 1000 tasks would be visible.

### Fixed
- Don't fetch task data if tasks are still building or failed to build (#127).
- Properly url-encode comments sent to external editors.


## [v3.00-alpha.5] - 2018-02-19
### Added
- Support Matomo/PIWIK analytics integration (#30).
- Add task review mode for challenge owners.
- Show task map and table to challenge owners when managing a challenge.
- Indicate to challenge owners if challenge tasks are still being built
  (or failed to build) when managing a challenge (#85).
- Offer cancel controls on various forms used by challenge owners.
- Show popup with task properties when feature is clicked on map while
  working on a task.
- Add user control for determining whether subsequent tasks in a challenge
  are loaded by random or by geographic proximity.

### Changed
- Improve labels and descriptions of project, challenge, and task form fields
  for challenge owners during the creation and editing process.
- Challenge tasks now load randomly by default, rather than by
  geographic proximity. This can be managed by the user on a per-challenge
  basis (#82).

### Fixed
- Fix clicking on project name as challenge owner when project search yields a
  single result (#116).
- Internationalize keyboard-shortcut labels.


## [v3.00-alpha.4] - 2018-02-12
### Added
- Dedicated route for challenge browse mode so it can be linked to directly.
- Show busy indicator while loading task clusters on challenge map (#64).
- When working on a task, challenge name now links back to browse mode (#79).
- Provide visual cue to user when moving to next task (#75).
- New control to clear all challenge filters (#60).
- Make initial zoom values when creating a challenge configurable in .env file.
- README section on how to update to the latest code.
- Other minor enhancements.

### Changed
- Mute comment-icon badge color when no comments (#53).
- Declutter create-and-manage pages for non-superusers.
- Increased zoom of task inset map, and added extent map (#23).
- Reuse Id editor tab instead of opening a new one for each task (#54).
- Start challenges with a task visible on the current map when possible (#63).
- Social sharing of a challenge now links to browse-mode.
- Saved Challenge links on user profile page now link to browse mode.
- Refer to "saving" a task as "tracking" the task to avoid confusion. (#81)
- Represent tracking a task as a switch instead of a button.

### Fixed
- Correctly map challenges with missing bounding polygon (#57).
- Correctly map tasks with missing location points (#6).
- Don't offer owners Start Challenge link on challenges in failed status (#80).
- Create/Edit challenge form shows that instructions field is required (#73).

### Removed
- Project filtering in create-and-manage for users with single project.


## [v3.00-alpha.3] - 2018-02-05
### Added
- Add metrics tab to to View Projects page sidebar.
- Show task clusters on locator map when browsing a challenge.
- Allow user to start a task by clicking on a task marker on map.
- Allow task instructions to be collapsed/minimized (#29).
- Allow social sharing to be disabled.
- Require confirmation from user before deleting a challenge.
- Add link to start challenge on View Challenge page (#35).
- Other minor improvements.

### Changed
- Improve local map-bounded searches by utilizing challenge bounding data.
- Modularize lodash functions to reduce size of MR3 distribution file.
- Don't show duplicate errors to user in event of multiple failures.
- Make existing task status more visually obvious when completing a task.

### Fixed
- Fix task completion button layout (#39).
- Fix create-and-manage headings on smaller desktop screens (#36).
- Fix user experience around deleting challenges (#37).

### Removed
- Temporarily remove delete project control.


## [v3.00-alpha.2] - 2018-01-29
### Added
- Begin roughing out View Project in create-and-manage area.
- CHANGELOG.md file

### Changed
- Numerous visual fixes and changes, especially around task completion.
- README updated

### Fixed
- Fix unit tests to run in any timezone.
- Allow completion comment to be submitted from Step 2 of task completion (#8).
- Fix erroneous challenge searches (#14, #16, #20)
- Only show allowed status controls based on existing task status (#3)
- Varous visual fixes (#4, #9)


## [v3.0.0-alpha.1] - 2018-01-24
### Added
- Initial release
