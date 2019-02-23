/**
 * Registry of dashboard widgets that ship with MapRoulette. First-party
 * widgets are imported immediately below. Then the registry of contributed
 * widgets is pulled in.
 */

// Import first-party widgets shipped with MapRoulette
export { default as ProjectAboutWidget } from './ProjectAboutWidget/ProjectAboutWidget'
export { default as ProjectListWidget } from './ProjectListWidget/ProjectListWidget'
export { default as ProjectOverviewWidget } from './ProjectOverviewWidget/ProjectOverviewWidget'
export { default as ProjectManagersWidget } from './ProjectManagersWidget/ProjectManagersWidget'
export { default as ChallengeOverviewWidget } from './ChallengeOverviewWidget/ChallengeOverviewWidget'
export { default as ChallengeTasksWidget } from './ChallengeTasksWidget/ChallengeTasksWidget'
export { default as ChallengeListWidget } from './ChallengeListWidget/ChallengeListWidget'
export { default as CommentsWidget } from './CommentsWidget/CommentsWidget'
export { default as BurndownChartWidget } from './BurndownChartWidget/BurndownChartWidget'
export { default as CalendarHeatmapWidget } from './CalendarHeatmapWidget/CalendarHeatmapWidget'
export { default as LeaderboardWidget } from './LeaderboardWidget/LeaderboardWidget'
export { default as RecentActivityWidget } from './RecentActivityWidget/RecentActivityWidget'
export { default as StatusRadarWidget } from './StatusRadarWidget/StatusRadarWidget'


// Import (optional) contributed widgets specific to local installation.
//
// Webpack hack: by using require with a template string, we can avoid a build
// error if no 3rd-party widgets are present and we can still .gitignore the
// `contrib/` directory so they don't accidentally get committed if they are
// present.
const contribFolder = './contrib'
let moduleId = null

// First see if we can locate a contrib/widget_registry.js module. If not,
// there's nothing more to do.
try {
  moduleId = require.resolve(`${contribFolder}/widget_registry.js`)
}
catch(e) {}

if (moduleId) {
  console.log("3rd-party widgets found. Loading.")

  try {
    require(`${contribFolder}/widget_registry.js`)
  }
  catch(e) {
    console.log("Failed to load 3rd-party widgets:")
    console.log(e)
  }
}
