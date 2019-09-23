/**
 * Registry of widgets that ship with MapRoulette. First-party widgets are
 * imported immediately below. Then the registry of contributed widgets is
 * pulled in.
 */

// Import first-party widgets shipped with MapRoulette
export { default as TaskBundleWidget }
       from './TaskBundleWidget/TaskBundleWidget'
export { default as TagDiffWidget }
       from './TagDiffWidget/TagDiffWidget'
export { default as TaskMapWidget }
       from './TaskMapWidget/TaskMapWidget'
export { default as TaskInstructionsWidget }
       from './TaskInstructionsWidget/TaskInstructionsWidget'
export { default as TaskCompletionWidget }
       from './TaskCompletionWidget/TaskCompletionWidget'
export { default as TaskReviewWidget }
      from './TaskReviewWidget/TaskReviewWidget'
export { default as TaskHistoryWidget }
       from './TaskHistoryWidget/TaskHistoryWidget'
export { default as TaskMoreOptionsWidget }
       from './TaskMoreOptionsWidget/TaskMoreOptionsWidget'
export { default as TaskPropertiesWidget }
      from './TaskPropertiesWidget/TaskPropertiesWidget'
export { default as KeyboardShortcutsWidget }
       from './KeyboardShortcutsWidget/KeyboardShortcutsWidget'
export { default as TaskLocationWidget }
       from './TaskLocationWidget/TaskLocationWidget'
export { default as TaskStatusWidget }
       from './TaskStatusWidget/TaskStatusWidget'
export { default as CompletionProgressWidget }
       from './CompletionProgressWidget/CompletionProgressWidget'
export { default as ChallengeShareWidget }
       from './ChallengeShareWidget/ChallengeShareWidget'
export { default as TopUserChallengesWidget }
       from '../TopUserChallenges/TopUserChallengesWidget'
export { default as SavedChallengesWidget }
       from '../SavedChallenges/SavedChallengesWidget'
export { default as FeaturedChallengesWidget }
       from '../FeaturedChallenges/FeaturedChallengesWidget'
export { default as PopularChallengesWidget }
       from '../PopularChallenges/PopularChallengesWidget'
export { default as SavedTasksWidget }
       from '../SavedTasks/SavedTasksWidget'
export { default as UserActivityTimelineWidget }
       from '../ActivityTimeline/UserActivityTimeline/UserActivityTimelineWidget'
export { default as ReviewTableWidget }
      from './ReviewTableWidget/ReviewTableWidget'
export { default as ReviewStatusMetricsWidget }
      from './ReviewStatusMetricsWidget/ReviewStatusMetricsWidget'
export { default as ReviewTaskMetricsWidget }
      from './ReviewTaskMetricsWidget/ReviewTaskMetricsWidget'
export { default as ReviewMapWidget }
      from './ReviewMapWidget/ReviewMapWidget'


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
