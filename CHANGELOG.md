# Changelog
All notable changes to this project will be documented in this file.

The format is based on
[Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

This project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [v3.11.3] - 2022-12-13

### Features
- Super Admin Metrics - Projects and Users
- add priority rules to bulk edit
- create users findAll service for superusers (API)
- Add ability to multiselect challenges in review table
- add changesetUrl to tag fix flow

### Fixes
- encode comments to allow special characters
- add % sign in Challenge Completion Widget tooltip
- disable OSM file download/upload
- prevent duplicate notifications in task bundles (API)
- conditionalize config in SortedChallenges

### System Updates
- add mastodon link to readme
- Bump decode-uri-component from 0.2.0 to 0.2.2
- Bump express from 4.17.1 to 4.18.2
- Update docs to show how to import the project (API)

## [v3.11.2] - 2022-11-22

### Features
- Add ability to download challenge OSM file

### Fixes
- Challenge comments not sending notifications
- Discoverability page not populating some results

### System Updates
- Update to jackson 2.13.4 (API)

## [v3.11.1] - 2022-11-15

### Features
- Super Admin Metrics - Challenges table

## [v3.11.0] - 2022-11-08

### Features
- add Properties to Export input to bulkEdit
- Remove resolution dropdown from screen appropriately
- maximize size of next nearby task map 
- store api key in OSM (API)

### System Updates
- Update a few dependencies (API)
- Provide missing IDs to withOptionCaching (API)
- Fix warnings for "Auto-application to () is deprecated" (API)

## [v3.10.1] - 2022-10-11

### Features
- Add preferred tags to bulk challenge edit
- Change title of conversation tab
- Link user profiles to OSM profiles on leaderboard
- Pages now have unique titles in browser history
- Add Challenge Comment Notifications for Owners (API)
- modify mappedOn date depending on task status (API)

### Fixes
- Cancel debounce on map move
- Fix typos in routes files (API)

### System Updates
- Allow automatic minor and patch updates to react-scripts
- Update to swagger-ui 4.14.2 and tweak its config (API)
- Update to sbt-scalafmt 2.4.6 and check *.sbt during CI (API)
- scalastyle: Switch to com.beautiful-scala:sbt-scalastyle (API)
- Use only sonatypeOss releases resolver (API)
- Update: scala 2.13.9 and sbt-scalafix 0.10.3 (API)
- Create the CaffeineCache implementation (API)

## [v3.10.0] - 2022-09-13

### Features
- Add ability to bulk edit challenge tags
- Tasks Updting UI
- Overlapping node markers

### Fixes
- Properly format the editor name for iD
- Modify bulk task status update into a build flow (API)
- Update nivo dependencies and add nivo/core

### System Updates
- Bump terser
- Bump jsdom
- Apply scalafmt and require scalafmtCheck during CI build (API)
- Update sbt, joda, postgres dependencies (API)

## [v3.9.2] - 2022-08-09

### Features
- Add capability to mass move and delete challenges from projects

### Fixes
- Add flex wrap to tags input fields 

### System Updates
- Upgrade React Scripts; Remove unused variables; Add global jest mock functions for incompatible npm libraries; increase unit test coverage
- Remove node-sass and bulma from the project in favor of dart-sass and tailwind
- Set thread pool sizes for akka default-dispatcher and hikaricp db (API)

## [v3.9.1] - 2022-07-12

### Features
- create retention for last selected layout
- Added 1 hour leaderboard caching

### Fixes
- prevent negative review time values (API)

### System Updates
- Document build/run approach using docker
- Update browserslist
- Remove references to end-of-life'd node 12
- add codecov to CI
- Auto-fix unused imports using 'sbt scalafixAll' (API)
- Fail the build if there are unused imports (API)
- Update many runtime dependencies (API)
- Jacoco analysis of unit tests (API)
- Run sbt tests and dependencyTree during CI (API)

## [v3.9.0] - 2022-06-14

### Added
- Additional instruction during task completion for owners to check work
- Error tags will now appear in task widget history
- Changed titles and sourcing of challenge overview dates
- Removed API_HOST from swagger.yml (API)
- task_refresh_date is now changed when tasks are uploaded/added to challenge (API)
- Added capability to search for challenges by ID during Virtual Project Mgmt

### Fixed
- Trim white spaces from challenge tags on submit
- Restored challenge custom basemaps
- Virtual challenges creation when using lasso tool
- filter out deleted tasks in taskCluster (API)

## [v3.8.1] - 2022-05-10

### Added
- Lock storage events to improve prompting relock attempts on tasks
- Upgrade async module
- default completed_time_spent on completed tasks (API)
- Add API version to swagger page (API)

## [v3.8.0] - 2022-04-12

### Fixed
- Upgrade to Mapillary v4
- Remove duplicate completion_time for bundled tasks (API)
- Update priority rules during challenge edit for remote GeoJson (API)

### Added
- Add Markdown and mustache tags Documentation URL

## [v3.7.16] - 2022-03-08

### Fixed
- remove redundant "be an instant" transifex strings
- upgrade url-parse, follow-redirects, ajv libraries

### Added
- Add ability to download CSV reports 10k tasks at a time
- Error tags for review flow

## [v3.7.15] - 2022-02-08

### Fixed
- add task specific properties to custom url widget
- honor priority rule updates to tasks when editing challenge
- fix task id reference in setBundleTaskReviewStatus causing error
- update shelljs and follow-redirects libraries

## [v3.7.14] - 2022-01-11

### Added
- add ability to filter by mapped_on date on review page

### Fixed
- fixed various translation mappings throughout application

## [v3.7.13] - 2021-12-14

### Added
- add env variable for stale date for archived challenges
- add stale date configurability to archiveChallenges job (API)
- Upgrade react, redux, apollo, graphql, node-sass, postcss
- add evolution for indexes manually added for performance (API)

### Fixed
- handle null locations for task activity
- add more restriction to updateLocations (API)
- add updatePriority protocol on new task uploads (API)

## [v3.7.12] - 2021-11-09

### Added
- User setting "Show Tag Fix Suggestions"
- Added new review approval statuses
- Task Review History Report

## [v3.7.11] - 2021-09-14

### Added
- Scheduler for Archiving Stale Challenges (API)
- Add Archived Filter Toggle to Challenge Discoverability
- Add capability to bulk archive challenges on Project Management page
- Add capability to sort by challenge completion
- Changeset URL now defaults to true; verbiage change
- Add variable cap to the number of tasks allowed in a challenge.

### Fixed
- Fix missing Review Duration values for CSV exports (API)
- Fix link in inbox notifications for challenge comments

## [v3.7.10] - 2021-08-03

### Fixed
- Expose 403 lock errors to the user error modals
- Distinguish page from offset in challenge /children search (API).

## [v3.7.9] - 2021-07-13

### Added
- Challenge comments
- Review and Revision Count Notifications

### Fixed
- Upgrade react-syntax-highlighter dependency

## [v3.7.8-rev2] - 2021-06-22

### Fixed
- Fixed issue where changesetUrl is required (API).
- Add OSM editor button to coop tasks.
- Distinguish page from offset in challenge search (API).

## [v3.7.8rev1] - 2021-06-09

### Fixed
- Unable to upload tasks (API). [(895)](https://github.com/maproulette/maproulette2/issues/895)
- Unable to do batch status changes [(1613)](https://github.com/osmlab/maproulette3/issues/1613)
- Instruction Widget expand/collapse toggle fix.

## [v3.7.8] - 2021-06-02

### Added

- Ability to prebundle tasks by a task property before creating a challenge
- Ability to archive projects and challenges
- Polish language support
- Ability to add the challenge URL to task changeset comment

### Changed

- Challenge authors will now be required to provide an email address

## [v3.7.7] - 2021-04-07
### Added
- Ability to see and add comments in the Task Bundle widget

### Fixed
- Dropdown menu positioning issues
- Task Overview page "Review" link now passes more accurate filtering tags
- Bump elliptic from 6.5.3 to 6.5.4
- Bump y18n from 4.0.0 to 4.0.1

### Changed
- New import/export modal design and images


## [v3.7.6] - 2021-03-03
### Added
- Ability for challenge managers to restrict iD and RapId presets (#1012)
- More prominent edit-tags control for Tag Fix cooperative challenges
- Performance improvements to browse-project page
- Updated help text describing creation of virtual projects by @mvexel

### Fixed
- Extraneous "county" label on Location widget (#1568) by @jschwarz2030
- Endless spinner trying to manage missing project (#1537) by @jschwarz2030
- Tag metrics limited to tasks for which a task review was requested (#1547)
- Tasks table sometimes renders empty for manager after editing challenge
- Saved filters not always applied correctly from Challenge Management page
- Altering layer on Supplemental Map widget also affects Multi-Task Work widget
- Existing priority-rule bounds not used when editing geographic rules via map
- Multi-Task work widget displays locked tasks
- Next task served for task review not always next successive task in queue
- Review next nearby task requiring desired task to be selected on map
- Internal project name sometimes shown in Task Review instead of display name
- Tag Fix widget showing up in Task Review workspace
- Tasks completed by others sometimes appearing in My Reviewed Tasks


## [v3.7.5] - 2021-02-03
### Added
- More compact workspace headers (#1388)

### Fixed
- Submitting task revision unnecessarily loads additional task data
- Managing huge projects can make frontend unresponsive (#750)
- Various performance problems (#1538, #1542)

### Changed
- Project completion metrics in Create & Manage now require manual load


## [v3.7.4] - 2021-01-28
### Fixed
- Error when trying to review task after using browser back button
- Unable to review consecutive tasks using Task Status "all" filter
- Overlay indicating screen is too narrow sometimes obscured


## [v3.7.3] - 2021-01-27
### Added
- Additional performance optimizations

### Fixed
- Mappers unable to submit revisions after failing a task review
- Cannot always search for destination project when moving a challenge
- Users end up on Find Challenges page when using virtual challenge share link
- Missing "review further" option from Task Review


## [v3.7.2] - 2021-01-25
### Added
- Optional Supplemental Map widget during task completion (#1492)
- Colored task map-marker lines when spidered
- Updated translations (huge thank you to the community!)
- Performance optimizations around task reviews

### Fixed
- Failure to render Markdown images and horizontal rules (#1512, #1518)
- Challenge keyword filters not honored in copy/pasted URLs (#1514)

### Changed
- Review metrics and Tag metrics widgets now require manual load


## [v3.7.1] - 2021-01-21
### Fixed
- Certain saved task-property filters could crash tasks table widget (#1513)


## [v3.7.0] - 2021-01-21
### Added
- Achievements
- Meta-Reviews
- Improved templating system for Challenge Instructions
- New copyable (copy-to-clipboard) shortcode in Challenge Instructions (#947)
- Workspace properties for templating in addition to task properties
- New optional Custom URLs widget in task-completion workspace
- Turkish locale and updated translations (huge thanks to the community!)
- Spidering of overlapping task markers on certain maps
- Support for `@type` and `@osm_type` feature properties for task OSM type
- OSM Profile and OSMCha external links on user metrics page
- Link to MapRoulette blog in site footer

### Fixed
- Task review refresh button not functioning properly
- Unrecoverable error in some cases when corrupted workspace imported
- Review metrics for empty projects showing system-wide metrics
- Multi-task Work widget recenter control recentering on prior task (#1481)
- Task review filters not always honored if changed mid-review
- Challenges with no tasks from Overpass left in Ready status (#986)
- MR tags sometimes sticking between reviews of tasks
- Cut-off dropdowns in Safari when viewing Review tables with no results
- Contested reviews attributed to wrong user in Task History widget
- Challenge-level constraints on allowed MR tags not always honored

### Changed
- Form-field templating in Challenge Instructions now rendered inline
- Most relative dates replaced with actual dates (#1479)
- No-results message replaced with total count in footer of Review tables


## [v3.6.16] - 2020-12-16
### Fixed
- Inability to recover from certain forms of workspace corruption
- Challenge filters not honored when moving to next task for review


## [v3.6.15] - 2020-12-09
### Added
- New lasso-based workflow for creation of virtual challenges
- Fit-world control to Find Challenges map for quickly zooming back out
- Configuration option in Location widget to show Lat/Lon vs Lon/Lat
- Additional details for each task shown on Tracked Tasks widget
- Display of current owner of task lock if attempt to lock a task fails
- Limit of 1500 characters in task comments

### Fixed
- Multi-task Work Widget map could be shrunk until controls unusable
- Inability to horizontally scroll nominatum search results with long names
- Task bbox ignoring bundled tasks (fit-to-bounds control, OSMCha link)
- Misleading label for OSM/External id field during challenge creation
- URL query parameters lost during sign-in process redirection
- Map controls occasionally disappearing in Safari

### Changed
- Name of challenge GeoJSON export filename for improved JOSM compatibility


## [v3.6.14] - 2020-11-04
### Added
- Updated community translations (huge thank you to translators!)
- Allow map overlays to be reordered
- Offer choice of features when map click is ambiguous
- Highlight selected map feature
- Ability to save filter setups for various tables
- Support for arrow keys on auto-suggest dropdowns
- Control for repositioning task bundle map over primary task
- Option to favorite/unfavorite challenge from task completion page
- New optional OSM History widget in task completion
- Show count of unread notifications in top navbar
- Show projects alongside challenges on various Dashboard widgets
- Show name of challenge on challenge-deletion confirmation dialog (#1407)
- [internal] Various upgrades of package dependencies

### Fixed
- Task Instructions widget not expanding back to configured height
- Location map not expanding even when its widget is expanded
- Failure when non-reviewer visited Review page
- Search by partial project/challenge name in review table
- Timezone selection changing to UTC-12 when UTC was selected
- Missing internationalizations on home page and table controls (#1262)


## [v3.6.13] - 2020-10-12
### Fixed
- Comment mention dropdown interfering with adding newlines to comment


## [v3.6.12] - 2020-10-07
### Added
- Updated translations and new Vietnamese locale (thank you translators!)
- learn.maproulette.org as the new home for MapRoulette documentation
- Typeahead dropdown when mentioning a user in a comment
- Ability to specify OSM element type when creating challenges from Overpass
- Search for challenges by id when adding challenges to virtual projects
- Allow tasks to be reviewed consecutively from Manage Challenges tasks table
- Basic support for multiple reviews of task by different reviewers
- Deselect-all control to Lasso map tool panel

### Fixed
- Challenge datasource could revert back to original cloned source (#1381)
- Don't offer Start Challenge button when managing completed challenges
- Incorrect subdomain substitution in basemap URLs
- Inability to sort by cooperative challenges (#1395)
- Inability to update user settings if no custom basemaps set
- User metrics filtering on creation date instead of completion date
- Minor visual fixes

### Changed
- false_positive column to not_an_issue in CSV exports
- [internal] Renamed primary branch of code repository to `main`


## [v3.6.11] - 2020-09-10
### Added
- Info control on challenge results to quickly view basic challenge details
- Show directionality for one-way task features on Task Completion map
- Support for multiple custom user basemaps and overlays
- Allow task status to be changed when resubmitting task after a review
- Option to load more tasks on Nearby Tasks map
- Lasso select/deselect tools on task map when managing a challenge
- Improved task selection behavior when managing a challenge
- Highlight selected tasks on task map when managing a challenge
- Error on z-coordinates in GeoJSON, noting they are unsupported (#1034)
- Error on null GeoJSON geometries, noting they are unsupported (#551)
- Note rebuild-tasks option when editing read-only data source (#1318, #783)
- Make substituted URL property values clickable in task instructions (#1370)

### Fixed
- Misinterpretation of some user mentions as OSM entity short codes
- Broken "Back to Review All" option on task revision confirmation modal
- Unnecessary restriction on max zoom on Nearby Tasks map
- Incorrect project-level average time spent per task
- Stale data sometimes shown on Review-Status Metrics widget

### Removed
- Quick-selection of tasks by status, priority, etc. in challenge managment


## [v3.6.10] - 2020-08-07
### Fixed
- Mustache tags in Task Instructions showing stale values (#1354)


## [v3.6.9] - 2020-08-06
### Fixed
- Unable to open tasks in JOSM during task review (#1353)


## [v3.6.8] - 2020-08-05
### Added
- Updated community translations (huge thanks to all the translators!)
- Send active imagery layer to editors when completing task (#1151, #1230)
- Enlarge busy spinner on maps (#1343)
- Use overlay to display browser-too-narrow message (#1033)
- Export of task-review CSV at the project level for project managers
- Display of top reviewers in Leaderboard widget for challenge managers
- Notify mappers when a challenge they worked on has been completed
- Option to view task instructions on completion confirmation modal

### Fixed
- Broken export of challenge CSV when using timezone with positive offset
- Minor display issues on User Dashboard page
- Missing int'l message that could prevent previews of markdown content


## [v3.6.7] - 2020-07-23
### Added
- Revised challenge creation/editing workflow
- Ability to cancel editing of a widget workspace
- Offer custom date-range options on all leaderboards
- Additional informational columns on leaderboard widget
- Ability to set preferred MR Tags for Task Review at challenge creation
- Option to choose desired timezone when exporting challenge CSV/GeoJSON

### Fixed
- Search sometimes including extraneous results (#1297)
- Display of relative dates in Safari
- Crash when attempting to displaying cooperative task error
- Error when switching priority rule types when editing a challenge
- Leaderboard widget displaying Current Month regardless of saved setting
- Leaderboard widget not updating properly for Past Month option
- Occasional failure to load challenge leaderboard if server response is slow
- Hang if browser back button used immediately following completion of a task
- Funky scrollbar behavior when choosing custom date ranges throughout app
- High memory consumption on Live Activity page if left open for long periods
- exact-dates setting not honored on Follow Activity view

### Changed
- Limit leaderboard custom date ranges to past year
- Refer to challenges and projects as Discoverable instead of Visible
- New challenges are now set to Discoverable by default


## [v3.6.6] - 2020-07-06
### Fixed
- Task comments provided during confirmation step not saved
- Unable to setup location style rules in task prioritization rules


## [v3.6.5] - 2020-07-01
### Added
- Updated community translations (huge thanks to all the translators!)
- Map of nearby tasks on Task Review confirmation step
- Overlay of prioritized bounds on Challenge tasks map for challenge managers
- Support for RFC 7464 compliant formatting of line-by-line GeoJSON
- Include project and task link in Following activity
- Tri-State select-all control on Inbox page
- MR-tag metrics widget for challenge managers
- Basic global activity page
- Task attachments with initial support for JOSM reference layers
- [internal] Upgrade to node v12 LTS
- [internal] Numerous upgrades to package dependencies
- [internal] Various updates required for upgraded package compatibility

### Fixed
- Inform user if logged out when trying to lock a task (#1233)
- Positioning of confirmation modal
- Unclickable controls on Teams page for some browser window sizes
- Error when using multiple location rules
- Display of Featured Challenges widget on Safari
- Various display issues on Project Details page
- Task Review table page-size reset after every task review
- Clean up any negative timestamps left by bug maproulette/maproulette2#728


## [v3.6.4] - 2020-06-09
### Added
- Updated community translations

### Fixed
- Error during display of certain users with missing avatars


## [v3.6.3] - 2020-06-08
### Added
- Following of other users' MapRoulette activity
- Refreshed home page
- Teams page
- Notification when invited to join a Team
- Task prioritization by location for challenge managers

### Fixed
- Review page search boxes not allowing case-insensitive search
- Erroneous security errors immediately following creation of new project
- Long challenge names not wrapping properly in Challenge Highlights widget


## [v3.6.2] - 2020-05-28
### Added
- Revised Dashboard page
- Teams widget on Dashboard page
- Option to invert searches in various task tables
- Column for MR Tags on various task tables
- CSV export of mapper metrics for challenge owners and reviewers
- Bypass picker step when returning to Review as part of normal workflow
- Ability to edit task form responses when reworking a task
- Clarifying note about average time to complete challenge tasks
- Control to copy public challenge URL to clipboard when managing challenges
- Management tools for challenge snapshots for challenge managers
- Task Review metrics broken down by task status in Review Metrics widget
- Updated translations and new Ukrainian locale

### Fixed
- Join comma-separated priority-rule values based on rule (not group) operator
- Broken rendering of mustache tags in task forms (#1239)
- Minor visual fixes

### Changed
- Make the Dashboard page the landing page for users who are already signed-in
- Rename "Saved" challenges to "Favorite" challenges


## [v3.6.1] - 2020-04-28
### Added
- Links to review tasks on Browse Challenge and Browse Project pages

### Fixed
- User metrics failing to load
- Remove limit when fetching lists of challenges and projects for review


## [v3.6.0] - 2020-04-23
### Added
- Cooperative challenges
- Revised initial setup/search workflow for Reviewers
- Automatic expiration of review-requested status for old, unreviewed tasks
- Comma-separated value support in priority rules for challenge managers

### Fixed
- Blank Top User Challenges widget on User Dashboard
- Failure to display additional results when listing managed projects
- Virtual projects losing virtual status when edited (#1207)
- Virtual project challenges not refreshing after addition or removal (#1208)

### Changed
- Quick Fix challenges are now called Tag Fix challenges


## [v3.5.9] - 2020-04-09
### Added
- Require interaction before loading tasks in Review Map on Review Page
- Default to showing tasks with Fixed status on Review Page
- New "unnecessary" task-review status for use by challenge managers
- Update translations

### Fixed
- Transient display of incorrect challenge leaderboard results while loading
- Incorrect task count shown when bundling a large number of tasks with lasso
- Erroneous inclusion of virtual project destinations when moving a challenge
- Mixed-case or uppercase MapRoulette tags not saving on tasks (#1192)


## [v3.5.8] - 2020-03-25
### Added
- OpenStreetCam imagery map overlay during task completion
- Integration with Transifex for supporting community translations (#734)
- Additional locales: nl, ru-RU, fa-IR, cs-CZ
- Option to preview task comment Markdown during composition
- Link user mentions in comments to mentioned user's metrics page
- Separate rendering colors for nodes, ways, areas in OSM Data map overlay
- Control over display of nodes, ways, areas in OSM Data map overlay
- Enter and ESC keyboard shortcuts in Nominatim search box
- Show busy spinner while performing Nominatim search
- Show busy spinner while geolocating user when tasks Near Me requested
- Show administrative updates to tasks by challenge managers in task history
- Filtering by task priority in Task Review
- Ability to adjust task-review filters after each reviewed task
- Notify task reviewer when re-review requested after follow-up changes
- Make some widgets permanent in various Create & Manage dashboards
- Option to export project CSVs from main Create & Manage dashboard
- URLs to tasks and challenges in Project CSVs
- Display of mapper in Create & Manage tables for all tasks going forward
- New color palette for colored usernames shown in various tables
- Various minor UI and color adjustments
- Challenge flag indicating that local knowledge is required to work on tasks
- Server admin configuration option to disable default map layers
- Server admin configuration option to hide OSM Data map overlay

### Fixed
- Layer toggle unresponsive after failure to load map layer (#1177)
- Hiding task-feature map layer can cause map zoom to reset (#1167)
- Removing keywords from cloned challenge causes save to fail (#1188)
- Empty options menus for some challenges in Create & Manage
- Task completion keyboard shortcuts active during confirmation step
- Erroneous calculation of time spent on task if server clocks different
- Occasional display of old task review status due to stale cache


## [v3.5.7] - 2020-03-11
### Added
- Dark mode in Create & Manage area
- Sort challenges by Oldest on Find Challenges page by @brianjor (#935)
- 'missing' and 'exists' property filter operators
- Quick-entry of comma-separated property filter values
- Basic metrics for time spent working on tasks (#762)
- Time durations to entries in Task History widget
- Visual representation of status and priority of tasks shown on Nearby map
- Nearby vs Random option for "Next Task" control on completed tasks
- Limited challenge controls on Project dashboard in Create & Manage area
- Limited project controls on All-Projects dashboard in Create & Manage
- Invitation on Review page for non-reviewers to volunteer as reviewers (#835)
- Task priority column on Review page tables

### Fixed
- Date picker switching back to default dates
- Occasional broken display of empty MR tags on tasks
- Stale link to wiki documentation when creating a challenge (#912)
- Don't split challenge preferred tags on spaces (#1123)
- Status updates to all tasks in Create & Manage not applied to all (#1127)
- Possible error due to missing historical challenge snapshots
- Broken task links in exported comments CSV from Create & Manage
- Task status reset to Created when tasks rebuilt
- Extraneous quotes sometimes included in generated task names

### Changed
- Colors used for color-coded usernames shown in various tables


## [v3.5.6] - 2020-02-24
### Fixed
- Trouble adding new managers to projects (#1122)
- Tags added to a task bundle sometimes not applied to all tasks
- Visual bug with task-status change confirmation in Create & Manage


## [v3.5.5] - 2020-02-19
### Added
- Featured projects
- Custom task styling based on arbitrary feature properties
- Simpler OR'ing of multiple values on feature property search
- Tabulation of Review Status metrics by task priority
- Custom date range option when viewing user metrics
- Ability to work on task bundles from any member task
- [internal] upgrade Tailwind and other package dependencies

### Fixed
- Users not being made admins of projects they create (#433)


## [v3.5.4] - 2020-02-07
### Added
- Ability to designate task property as OSM id in challenge creation
- Ability to setup preferred task tags during challenge creation
- Reviewer-related stats on User Metrics page
- Proper links for challenge names on Find Challenges page (#997)
- Past Progress historical progress widget for challenges in Create & Manage
- Ability to filter tasks by id, mapper, and reviewer in Create & Manage
- Option to view tasks actively locked by a mapper in read-only preview mode
- Default to excluding task reviews assigned to others on Task Review page
- Support for basic point/marker "simplestyles" task-feature styling
- Dedicated sign-in page if user navigates to page requiring sign-in
- Various app-wide color and styling updates and fixes
- Minor speed-up to loading of challenge dashboard in Create & Manage
- [internal] Upgrade various package dependencies

### Fixed
- Incorrect display of 'view by priority' link on Project Detail page
- Occasional discrepency in count of tasks completed together (#1086)
- Erroneous treatment of en-US locale as invalid in User Settings
- Failure during display of Markdown containing explicit line-breaks
- Negative timers during task build or rebuild
- Erroneous option to sort tasks by feature columns, which is not supported
- Incorrect treatment of Current Month in user metrics
- Occasional wrong result when searching for certain users (#1061)
- Potential task loop when skipping tasks at a priority boundary
- [internal] Update unit tests


## [v3.5.3] - 2020-01-22
### Added
- Support for `out center` in Overpass queries by @Zverik
- Option for project managers to export CSV of tasks in project
- Compound filtering on task properties for challenge managers
- Customization of displayed columns and ordering on tasks tables
- Include more detail in challenge-completion notification emails
- Indicate when too many tasks are shown to create virtual challenge
- Snap task map-markers to line strings in task geometry
- Option to skip review of current task during task review
- Option to exclude task reviews (likely re-reviews) assigned to others
- Attempt to fall back to default map layer if custom basemap fails
- Ability to see challenge completion progress by task priority
- Minor updates to README

### Fixed
- Disabled challenges displayed on virtual project pages
- Erroneous offer to create virtual challenge from stale data
- Incorrect initial sorting of task review table
- Incorrect link to project leaderboard (#1044)
- Duplication of last MR tag when clicking away from tag input
- Inability to change data sourcing date on cloned challenge
- Lost "enabled" setting when creating a new virtual project

### Changed
- Renamed "All Reviewed Tasks" tab to "All Review-related Tasks"
- Replaced "Cancel Review" review control with "Unlock Task" control


## [v3.5.2] - 2019-12-18
### Fixed
- Inability to edit tasks that use non-string OSM id property values


## [v3.5.1] - 2019-12-16
### Added
- Creation of virtual challenges from task clusters
- Easier access to searching for challenges by project name
- Display of matching virtual projects for project-name searches
- New landing page for projects that lists their challenges (#1020)
- Notifications of challenge completion for challenge managers
- Challenge visibility quick-toggle from project management

### Fixed
- Sorting of task-review columns from challenge management page
- Failure to substitute task properties included in markdown links
- Missing challenge parents when viewing a virtual project
- Failure to filter by task properties containing a colon (#1004)
- Failure to reprioritize all tasks in some challenges (#999)
- Erratic map cluster behavior due to tasks with empty geometry


## [v3.5.0] - 2019-12-06
### Added
- Task browsing at much lower zoom levels on Find Challenges page
- Overlay on Find Challenges map with "Near Me" option and nominatum search
- Relocated location filters on Find Challenges page above search results
- Automatic refreshing of task locks while mapper is actively working on a task
- New option to explictly "unlock" (abandon) a task on task-completion page

### Fixed
- Potential wrong timezone on origin/sourcing date recorded for task data
- Occasional incorrect challenge-completion status resulting from stale checks
- Incorrect OSM entity ids sometimes sent to iD and JOSM editors

### Removed
- "Within Map Bounds" filter now that task browsing is offered at lower zoom


## [v3.4.6] - 2019-11-14
### Added
- Option to change task data source date when rebuilding tasks
- Link to challenge from Challenge Leaderboard (#967)
- Make challenge discovery status clearer to challenge managers
- [internal] Compatibility adjustments for backend API changes around task tags
- [internal] Upgrade various package dependencies

### Fixed
- Restore colors to task-cluster markers on maps


## [v3.4.5] - 2019-11-06
### Fixed
- Impaired ability to use lasso tool on Multi-Task Work widget


## [v3.4.4] - 2019-11-06
### Added
- Search for tasks by feature property in Create & Manage task map
- Use backend clustering on Create & Manage task map
- Use backend clustering on Challenge Details map
- Use backend clustering on Multi-Task Work Widget map
- Consolidate visually overlapping clusters from backend
- Additional resiliency around bad task geometry

### Fixed
- Challenges with no remaining tasks offered in search results (#934)
- Challenges containing skipped tasks treated as finished
- Failure to detect quick-fix setup data on task feature properties (#945)
- Difficult to read "other" keyword filter on challenge search (#960)
- Poor appearance of some Markdown elements, especially on light backgrounds
- Cramped property values in map popups for properties with long names
- Incorrect task status on Edit Task form in Create & Manage area
- Inability to navigate directly to Edit Task page in Create & Manage area
- Escaping of feature properties included as separate columns in CSV exports


## [v3.4.3] - 2019-10-16
### Added
- Short-codes in task comments for referencing OSM elements and map viewports
- Lasso task-selection tool on map when bundling together multiple tasks (#937)
- New field on challenge for tracking a separate origin date of task data
- Additional caution around sanitizing mustache tags in markdown
- [internal] Upgrade various package dependencies

### Fixed
- Empty popup boxes when clicking OSM data layer features (#910)
- Inadvertent challenge-creation form submission from keywords input (#911)
- Failure of certain challenges to build or rebuild (#933)
- Inconsistent display of changeset comment when cloning a challenge (#918)
- Erroneous application of simplestyle styling to task point features
- Erroneous attempt to syntax-highlight missing task geometry JSON
- Failure to retrieve all member challenges in large virtual projects
- Improper escaping of CSV export fields containing commas
- Malfunctioning filtering of locked tasks from task clusters


## [v3.4.2] - 2019-10-04
### Added
- Completion and review of multiple tasks together
- Templates for generating forms to be filled by mapper during task completion
- RapiD editor option by @gaoxm
- Updated help links by @mvexel
- Additional resiliency to missing task geometries
- Option to include specific task properties as columns in CSV exports
- Minor updates to home page

### Fixed
- Keyboard shortcuts not correctly accounting for modifier keys
- Broken profile pics for some users who uploaded their own avatars to OSM
- Error at end of challenge for users viewing nearby-tasks map
- Erroneous link that implied mappers could review their own tasks
- Locked tasks erroneously offered to users when browsing a challenge
- OSM elements not automatically selected in iD editor (#906)
- Quick-fix task properties not reflecting current OSM tags (#915)
- Task reset back to created status not served to recent viewer
- Potential divide-by-zero error when no results for challenge stats

### Changed
- Control for viewing all tags on a quick-fix tag diff from icon to text


## [v3.4.1] - 2019-09-17
### Added
- Current Month option to leaderboard (#885)

### Fixed
- iD editor not always opening to task location (#892)
- inadvertently modified challenge-progress bar background color
- map bounds not honored from pasted challenge search URL


## [v3.4.0] - 2019-09-12
### Added
- "Quick Fix" challenges that include proposed fixes for tasks
- Nominatum search control on various maps
- Improved Mapillary integration with iD editor (#845)
- Allow re-review of contested task reviews by original reviewer
- Improve UI of task-status bulk-update control for challenge managers
- Include virtual projects in project searches from challenge discovery
- A "disabled" task status allowing tasks to be disabled without deleting them
- Widget that displays the current task's properties
- Additional username colors for use in various table displays and reports
- Support for nested task-priority rules during challenge setup
- Review time column in Create & Manage tasks table for challenge managers

### Fixed
- Task features improperly communicated to iD editor for selection (#878)
- Challenge source not passed to iD editor (#846)
- Minor display issues in task-properties map popup
- Task status not always set to skipped after skipping a task
- Metrics widget in Create & Manage not always honoring active filters


## [v3.3.4] - 2019-08-08
### Added
- Support for system notices (e.g. notices of upcoming maintenance)
- Color-coded usernames in various tables
- Bulk task-status change for challenge managers

### Fixed
- Malfunctioning review-table date picker in Safari


## [v3.3.3] - 2019-07-25
### Added
- MapRoulette-specific tagging support for tasks ("MR Tags")
- Option to select next nearby task to work on from map of nearby tasks
- Export of challenges as GeoJSON from Create & Manage
- Honor active filters when exporting CSV and GeoJSON files
- Review Metrics widget for Create & Manage dashboards
- Toggle for inclusion of challenges in metrics in Create & Manage area
- Completion-progress indicators below each challenge in Create & Manage
- Show name of challenge parent project in virtual-project challenge listings
- Improved Mapillary integration and official Mapillary image viewer
- "All Time" duration option to Review Stats
- [internal] Upgrade various package dependencies, including React

### Fixed
- Bing map layer showing incorrect imagery
- Malfunctioning reviewed-on date filter on Tasks Review table
- Retrieval of next nearby task not honoring task priority
- JOSM editing bounds in task review inconsistent with task completion
- Task map in Create & Manage not resetting when all filters cleared
- Broken user profile images
- Broken links to top-challenges on leaderboards in some cases
- Insufficient Overpass timeout on attic queries
- Various minor visual fixes and adjustments

### Changed
- JOSM attic layer policy from locked to no upload and no download

### Removed
- Broken heatmap from Create & Manage project dashboard


## [v3.3.2] - 2019-06-20
### Added
- Virtual Projects
- Notification threading/grouping by task in inbox
- Export and import of widget workspace layouts
- Keyboard navigation to task-completion confirmation step
- Additional task-review tab for All Review-related Tasks
- Basic project-name search for mappers
- Automatically remove newly-excluded widgets from existing workspaces
- Explanatory message when user has skipped all remaining tasks in challenge
- Filters for review statuses on challenge dashboard for challenge owners

### Fixed
- Error when user set a custom basemap in user settings
- Error when mapper completed virtual challenge
- Occasional premature end of challenge after task completion
- Extra backslashes in Mustache-tag example in challenge creation help
- Invisible challenge-progress percentages for challenge managers
- Entries in Task History widget sometimes in incorrect order
- Missing new-notification indicator on fresh load of application
- Occasional missing results from project search for project managers
- Timeout rebuilding challenge when pruning many incomplete tasks
- Pinned projects not always showing all challenges to project managers
- Lost page-size and map bounds on Task Review page upon return
- Repeated serving of same skipped or too-hard task at priority boundary
- Non-reviewers prevented from disputing a task review
- Incorrect data in reviewer column in CSV export for challenge managers
- Frozen search box in Safari if search was rapidly changed many times

### Changed
- Don't alter pre-existing task status if a subsequent mapper skips the task


## [v3.3.1] - 2019-05-10
### Added
- Status-specific metrics in Completion Progress widget
- Updated Korean translation by @depth221
- Project filter on Review page
- Favorite Challenges filter on Review page
- Converted Review page to a widget workspace
- Review Metrics widget for Review page workspace
- Geographic filtering map widget for Review page workspace
- Preserve filters on Review page

### Fixed
- Do not apply date offset to attic query for task-start entry
- Ensure task gets properly locked when navigated to directly in browser
- Inconsistent user score in top nav vs. all-time leaderboard score
- Error when trying to review a task immediately after status change
- Lost challenge-name filter when consecutively reviewing a series of tasks
- Don't leave project leaderboard when changing timeframes (#743)
- Ensure task review data is reset if task status is reset back to created
- Orphaned task history when challenge moved to another project
- Old colorscheme on map controls

### Changed
- Map layers dropdown now activated/deactivated on click instead of hover


## [v3.3.0] - 2019-04-16
### Added
- Task reviews
- In-app notifications with optional emails
- New user settings for managing notifications and emails
- Brazilian Portuguese translation by @raphaelpe
- Updated Korean translation by @depth221
- Confirmation step when completing a task
- Comment mentions with `@[user name]` (spaces) or `@username` (no spaces)
- Task History widget on task-completion and task-review pages
- Task inspection link for challenge owners on task completion page
- Challenge detail page when navigating to a challenge URL
- All Time timeframe to Leaderboard, which is now the default
- Updated 404 page
- [internal] Upgrade various package dependencies, including React

### Fixed
- Default page title by @LoicUV
- Ensure line-by-line geojson upload progress shown (#701)
- Remove stale backend setup instructions from README
- Formatting of markdown lists
- JOSM communication in Safari (#580)
- Increase prominence of leaderboard refresh delay

### Changed
- Task completion comment now requested at confirmation step
- Random vs Nearby task loading setting moved to confirmation step
- Global leaderboard now defaults to All Time timeframe

### Removed
- Task Comments widget (users can use Task History widget instead)


## [v3.2.3] - 2019-03-12
### Fixed
- Honor task priorities when loading the next random task
- Allow task completion for non-final task statuses (e.g. Skipped)
- Scroll browsed challenge into view when navigating directly to it (#668)
- Permission error when navigating directly to project admin (#665)
- Missing busy spinner on sign-in buttons while determining login status
- "Owned" filter in admin projects not always showing owned projects
- CSV export URLs that could be incorrect for some server configurations
- Removed extraneous scrollbars
- Error when viewing an empty leaderboard
- Unreadable challenge-progress labels on hover
- Various minor visual fixes


## [v3.2.2] - 2019-02-28
### Added
- Offer "Not an Issue" on step 2 of task completion
- Zoom JOSM to task map bounding box after loading just features

### Fixed
- Ensure OSM Data Layer is deactivated after completing a task


## [v3.2.1] - 2019-02-25
### Added
- Create & Manage widget for managing project managers (#534)

### Fixed
- Excessive removal of unmatched tasks for line-by-line geojson by @Zverik
- Error when attempting to display zero points in points ticker
- Disallowed task status progressions sometimes offered in task completion
- Dropdown menus extending over widgets sometimes not fully interactive
- Modals sometimes appear behind widgets instead of in front of them
- Incorrect rendering of user settings form in Chrome

### Changed
- Name of User Profile page to User Settings

### Removed
- Tabs on Create & Manage project cards; only challenges are now shown


## [v3.2.0] - 2019-02-15
### Added
- New user interface
- Full-fledged home page (#426)
- New user dashboard page with quick access to challenges of interest (#521)
- Highlight new challenges (#509)
- Highlight popular challenges (#447)
- Task completion page is now widget based
- Access to all task-completion statuses from step 1 of task completion
- Points ticker in top-nav to see current score
- Updated README

### Fixed
- Require sign-in before naming a new virtual challenge (#579)
- Multiple trash cans in challenge-administration confusing (#529)

### Changed
- Create & Manage link has moved to dropdown menu in top nav
- The term "review" for spot-checking new tasks is now called "inspect"
- User now needs to be signed in prior to viewing task completion page
- [internal] redux store is no longer persisted
- [internal] back-end now treated as pure API server


## [v3.1.3] - 2019-02-05
### Added
- Support for [simplestyle](https://github.com/mapbox/simplestyle-spec) task-feature styling by @zverik
- Korean translation by @depth221
- OSM Data map layer with latest OSM data during task completion
- New keyboard shortcuts available during task completion: `s` to toggle
  visibility of the task-features layer and `o` to toggle the new OSM data
  layer on/off
- Display of logged-in user's leaderboard ranking even if not in top list
- Country-specific leaderboards
- Option to show more users on leaderboard to view further down the rankings
- Move discovery map with Nominatum search using `m/` search-box short command, e.g. `m/moscow`
- Display of total elapsed time when challenge tasks are building
- Display of count and percentage of tasks remaining alongside challenge progress

### Fixed
- Typo in Japanese translation by @higa4
- Missing "Manage" option when challenge owner browsing non-visible challenge
- Inability to remove default changeset comment from existing challenge

### Changed
- "Create" top-nav link is now "Create & Manage" to improve clarity
- Show Lon/Lat of task on task completion page instead of Lat/Lon


## [v3.1.2] - 2019-01-10
### Added
- Japanese translation by @higa4
- Allow commenting when reviewing task as a challenge owner (#138)
- Option to edit only task features in JOSM (#452)
- Include challenge search/filter criteria in URL for permalinking (#526)
- Public challenge- and project-specific leaderboards (#536)
- Allow longitudinal wrapping of maps (#593)
- Offer "near me" challenge location search to signed-out users
- Search-box short-command `m/` to move map to bounding box or centerpoint
- Paging in admin area to improve performance for users managing a lot of
projects and/or challenges
- Option to clear filters when analyzing challenge tasks in admin area
- Support numerical values and operators in challenge priority rule definitions
- Minor optimizations to reduce number of network requests
- [internal] Support front-end development without requiring installation of
local back-end development server

### Fixed
- Formatting fix in README by @kant
- Failure to clone challenges that used legacy basemaps (#549)
- Extraneous backslashes in custom basemap examples (#575)
- Confusing error message if browser window too narrow in admin area

### Changed
- keyboard shortcut key for opening Level0 editor is now `v` instead of `l`
- The "about" modal dialog has been changed to a simple home page as a placeholder
for an upcoming home page implementation

### Removed
- [internal] chimp end-to-end testing framework temporarily removed for Node.js 10
compatibility


## [v3.1.1] - 2018-11-12
### Added
- Mapillary map layer when completing tasks
- Support rebuild of challenges sourced from local or remote GeoJSON (#527)
- Option to remove unmatched tasks on challenge rebuild to reduce stale tasks
- Control to load more challenge results in search results
- Public leaderboards for each challenge (#536)

### Fixed
- Fix lag when typing a search query
- Show GeoJSON validation errors (lost in line-by-line enhancement)
- Allow switch to different GeoJSON source even after prior source had error
- Reduce extraneous scrollbars from Create dashboard (#519)


## [v3.1.0] - 2018-10-30
### Added
- Add more keyboard shortcuts for task completion (#477).
- Show age of tasks when browsing a challenge (#468).
- Show the lat/lon of task under Location (#467).
- Offer default layers and overlays from OSM Editor Layer Index (#466).
- Allow mustache tags in instructions that reference task properties (#456).
- New flexible, widget-based project/challenge administration interface (#450).
- When showing tasks on search map, indicate how many tasks are shown (#435).
- Support for Level0 editor (#423).
- Sort control for challenge results (#211).
- Help link in top navbar (#72).
- Support for streamable line-by-line GeoJSON format.
- Advanced option for challenge-owners to ignore detected GeoJSON errors.
- Support for map overlays.
- Use browser geolocation service for Near Me filter when available.
- Open links in markdown content in new tabs.

### Fixed
- Don't prompt user to login if page doesn't require it (#492).
- Don't prematurely display that a challenge is complete (#429, #458).
- Don't preserve zoom if task features won't fit on map (#451).
- Fix labels cut off on some charts (#448).
- Don't re-encrypt user API key on user profile updates (#437, #442).
- Allow challenge source to be modified if tasks fail to build (#436).
- User could sometimes receive duplicate task with old status (#428).
- Don't enable reset-tasks control for challenge owners if no tasks selected.
- Don't show challenges with no remaining tasks in search results (#464).

### Changed
- Allow user to skip task after opening editor (#469).
- Do not allow modification of priority for individual tasks (#390).
- [internal] Refactor challenge search to use unified service.


## [v3.0.6] - 2018-07-02
### Added
- Map control to fit task-completion map to task features.
- Animate task features on map when new task loads.
- Auto-suggest for challenge keywords when creating a challenge.
- Jump to desired workflow step when editing a challenge.
- Option to save-and-finish early when editing a challenge.
- Various enhancements to experimental mobile support.

### Fixed
- Don't offer edit-task link in admin task-map popup to project owners with
  read-only access.
- Inconsistent whitespace on user profile page.

### Changed
- Reuse task-completion map between tasks, preserving settings (#298).


## [v3.0.5] - 2018-06-22
### Added
- Congratulate user when a challenge is completed (#112).
- Challenge owners can set individual tasks to any status (#387).
- Challenge owners can bulk reset tasks to Created stauts (#326).
- Challenge owners can move challenges between projects (#328).
- Administration of project managers.
- Support for Read, Write, and Admin project manager roles.
- Improved handling of server authentication and authorization errors.
- Changeset source field on challenges with JOSM prefill (#361).

### Fixed
- Ensure latest API key displayed after multiple consecutive resets.
- Cloning a challenge could fail in some scenarios.
- Ensure all challenges shown to challenge owner (#396).

### Changed
- Relocated comments on task-completion sidebar (#296).


## [v3.0.4] - 2018-06-08
### Added
- Option on user profile page to reset API key
- Button on user profile page to copy API key to clipboard


## [v3.0.3] - 2018-06-08
### Security
- Prevent non-managers from viewing challenge admin page when following a
  direct link (#383).


## [v3.0.2] - 2018-06-04
### Added
- Allow all users to create new projects.
- New "Intersecting Map Bounds" challenge location filter.
- Experimental (disabled by default) basic support for mobile devices.
- Add last-activity date to challenge overview table (#221).
- Update README documentation.
- [internal] Upgrade various package dependencies, including React.

### Fixed
- Very slow edit-challenge forms for some challenges (#370).
- Refresh results from server after changes to challenge filters.

### Changed
- "Within Map Bounds" challenge location filter now only displays challenges
  centered within the map bounds. Its prior behavior of including any
  challenges with intersecting bounding boxes is represented by the new
  "Intersecting Map Bounds" filter (#88).
- Default to https for tile-server and other URLs.


## [v3.0.1] - 2018-05-15
### Added
- Additional error page for use by server in some situations.

### Fixed
- Navigating directly to non-existent task spins forever (#357).
- Export of challenge tasks CSV for challenge owners not working properly on
  Windows (#359).

### Removed
- Nav link to old UI


## [v3.00] - 2018-05-10
### Removed
- Beta badge and beta-specific introductory language.


## [v3.00-beta.8] - 2018-05-01
### Added
- Experimental (disabled by default) challenge overview table when viewing
  a project in admin area (#331).

### Fixed
- Admin project stats not restricted to currently-open project (#339).
- Incorrect display of wide or tall profile pics (#340).
- Admin area sometimes requires page refresh to show all challenges managed
  by user (#341).
- Users with slower connections could temporarily see erroneous warning about
  missing home project in admin area (#342).
- Confusing instructions around local file uploads when editing an existing
  challenge (#349).

### Changed
- Heatmap calendars in admin are now shown horizontally instead of vertically.


## [v3.00-beta.7] - 2018-04-25
### Added
- Ability to also search by challenge name in admin search (#205).
- Public leaderboard of top scoring users across various timeframes (#254).
- Leaderboard opt-out setting in User Profile.
- Challenge-specific leaderboards for challenge owners in admin area (#316).
- Display of user's own top challenges (by activity) on user profile page.
- Notice to challenge owners after creating or updating challenge that
  it can take up to 2 hours to complete geographic indexing (#234).
- MIT license for project (#295).

### Fixed
- Already-complete challenges included in search results (#283).
- Misaligned task-control buttons for some users (#323).
- Typo in link to Overpass guide fixed by @naoliv
- Busy indicator spins forever when attempting to browse a
  challenge pending deletion (#332).
- No error shown when admin attempts to navigate to non-existent
  challenge (#333).


## [v3.00-beta.6] - 2018-04-17
### Added
- Ability to delete projects (#243).
- [internal] End-to-end test setup with some initial tests.

### Fixed
- Wrapping of long challenge names on User Profile page (#300).
- Link for challenge owners to view task associated with comment (#299).


## [v3.00-beta.5] - 2018-04-09
### Added
- Require confirmation before rebuilding tasks.
- Automatic updates of task-build progress.
- Detect use of Overpass Turbo query shortcuts in Overpass queries (#256).
- Display of Challenge keywords in admin View Challenge sidebar (#244).
- Visibility quick-toggle in admin View Challenge sidebar (#183).
- Option to automatically add #maproulette hashtag to changeset comment (#290).
- Styling of user profile page (#276).
- User activity feed grouping by challenge (#28).
- Styling adjustments to admin forms (edit challenge, edit task, etc).
- Example PIWIK settings in .env file.

### Changed
- Only offer task rebuilding to challenges built from Overpass queries.
- Challenge source now read-only once tasks are built (#236).

### Fixed
- Include disabled projects in admin project search results.
- Display map-bounded tasks even if parent challenge previously unseen (#279).
- Don't allow map to wrap around world (#277).


## [v3.00-beta.4.2] - 2018-04-04
### Fixed
- Some challenges erroneously converted to N/A status (#284).


## [v3.00-beta.4.1] - 2018-04-03
### Fixed
- Treat missing challenge status as N/A (#275).


## [v3.00-beta.4] - 2018-04-02
### Added
- Reduce duplicate/unnecessary network requests to server.
- Offer challenge and user custom basemaps on map layer toggle (#218).
- Link app version number in About modal to release notes (#241).
- Basic management options for challenge owners when browsing a challenge
  they manage or working on tasks in challenges they manage (#245)
- Quick-share control next to challenge name when working on tasks (#231).
- Show task count to challenge owners as new challenge builds (#235).
- CSV export of tasks table for challenge owners (#124).
- Mobile landing page (#263).

### Changed
- GeoJSON validation failures no longer show line numbers.

### Fixed
- Safari extremely slow validating uploaded GeoJSON (#222).
- Tolerate task GeoJSON with missing features.
- Avoid bouncing between two tasks when skipping (#220).
- URL used to start a virtual challenge when clicking a task on map (#257).
- Tooltips in Firefox on minimized sidebar when working on tasks (#255).
- Show tasks to challenge owner for partially-loaded challenges (#264).
- Tolerate load of project data when challenge owner viewing challenge.
- Don't skip rendering of locator map when no clustered tasks.
- Don't offer Start Challenge control to challenge owners if the challenge
  has no tasks (#271).

### Removed
- Next Task option for end users when viewing a task with an existing status if
  that task can still reasonably be assigned a new status by the user.

## [v3.00-beta.3.1] - 2018-03-28
### Fixed
- Infinite loop browsing non-existent or disabled challenge (#246).
- Collapsing of browsed challenge (#247).


## [v3.00-beta.3] - 2018-03-26
### Added
- Virtual challenges created from map-bounded tasks now exactly match
  tasks displayed on the map.
- Support browsing virtual challenges via direct URL.
- Visual indicator when working on, or browsing, a virtual challenge.
- Display reason if creation of virtual challenge fails.
- Notify user if attempt is made to work on an expired virtual challenge.
- Renew virtual challenge expiration when there is new activity on it.
- Allow virtual challenge duration to be configured via .env file.
- Move extra task controls into new collapsible "More Options" section (#189).
- Toggling of task-features layer on or off when working on tasks (#202).
- Challenge progress bars now reflect task-status breakdown (#201).
- Performance improvements to challenge results-list rendering.
- More informative message to challenge owner if challenge has no GeoJson.
- Reason for failure to build tasks now shown to challenge owner (#86).
- Various minor user interface tweaks and improvements.

### Changed
- GeoJSON tab in challenge creation/editing is now optional (#200)

### Fixed
- Challenge status is no longer carried over when cloning a challenge.
- Challenge data is properly loaded when following a browse link (#224).


## [v3.00-beta.2] - 2018-03-19
### Added
- Back-to-MR2 banner link in navbar (#172).
- Heatmap calendar of task activity for challenge owners.
- Support for `osmIdentifier` as OSM id property in GeoJSON.
- Application of challenge filters to (experimental) map-bounded tasks.
- Validation of locally-uploaded GeoJSON when creating/editing a challenge.
- Syntax highlighting of GeoJSON when viewing a task as challenge owner.
- Tag-style input of additional keywords when creating/editing a challenge.
- Support for rebuilding challenges.
- Support for custom keyword category configuration in .env file.

### Changed
- Burn-down charts for challenge owners now go back to the creation
  date of the project/challenge in question.
- Challenge names shown in results are no longer start-cased.

### Fixed
- User profile page is now more resilient to slow-loading or incomplete data
  (#177).
- Prevent stale map data from inadvertently being sent to editors (#180).


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
