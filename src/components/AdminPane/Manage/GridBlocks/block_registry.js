/**
 * Registry of dashboard blocks that ship with MapRoulette. First-party blocks
 * are imported immediately below. Then the registry of contributed blocks is
 * pulled in.
 */

// Import first-party blocks shipped with MapRoulette
export { default as ProjectAboutBlock } from './ProjectAboutBlock/ProjectAboutBlock'
export { default as ProjectCountBlock } from './ProjectCountBlock/ProjectCountBlock'
export { default as ProjectListBlock } from './ProjectListBlock/ProjectListBlock'
export { default as ProjectOverviewBlock } from './ProjectOverviewBlock/ProjectOverviewBlock'
export { default as ChallengeOverviewBlock } from './ChallengeOverviewBlock/ChallengeOverviewBlock'
export { default as ChallengeTasksBlock } from './ChallengeTasksBlock/ChallengeTasksBlock'
export { default as ChallengeListBlock } from './ChallengeListBlock/ChallengeListBlock'
export { default as CommentsBlock } from './CommentsBlock/CommentsBlock'
export { default as CompletionProgressBlock } from './CompletionProgressBlock/CompletionProgressBlock'
export { default as BurndownChartBlock } from './BurndownChartBlock/BurndownChartBlock'
export { default as CalendarHeatmapBlock } from './CalendarHeatmapBlock/CalendarHeatmapBlock'
export { default as LeaderboardBlock } from './LeaderboardBlock/LeaderboardBlock'
export { default as RecentActivityBlock } from './RecentActivityBlock/RecentActivityBlock'
export { default as StatusRadarBlock } from './StatusRadarBlock/StatusRadarBlock'


// Import (optional) contributed blocks specific to local installation.
//
// Webpack hack: by using require with a template string, we can avoid a build
// error if no 3rd-party blocks are present and we can still .gitignore the
// `contrib/` directory so they don't accidentally get committed if they are
// present.
const contribFolder = './contrib'
let moduleId = null

// First see if we can locate a contrib/block_registry.js module. If not,
// there's nothing more to do.
try {
  moduleId = require.resolve(`${contribFolder}/block_registry.js`)
}
catch(e) {}

if (moduleId) {
  console.log("3rd-party blocks found. Loading.")

  try {
    require(`${contribFolder}/block_registry.js`)
  }
  catch(e) {
    console.log("Failed to load 3rd-party blocks:")
    console.log(e)
  }
}
