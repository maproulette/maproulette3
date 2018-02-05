# Changelog
All notable changes to this project will be documented in this file.

The format is based on
[Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

This project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html).


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
