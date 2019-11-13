import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { visibleLayer } from './services/VisibleLayer/VisibleLayer'
import { visibleOverlays } from './services/VisibleLayer/VisibleOverlays'
import { currentUser, userEntities } from './services/User/User'
import { projectEntities } from './services/Project/Project'
import { challengeEntities } from './services/Challenge/Challenge'
import { virtualChallengeEntities }
       from './services/VirtualChallenge/VirtualChallenge'
import { taskEntities } from './services/Task/Task'
import { currentClusteredTasks } from './services/Task/ClusteredTask'
import { currentTaskClusters } from './services/Task/TaskClusters'
import { currentBoundedTasks } from './services/Task/BoundedTask'
import { currentReviewTasks } from './services/Task/TaskReview/TaskReview'
import { commentEntities } from './services/Comment/Comment'
import { placeEntities } from './services/Place/Place'
import { currentSearch } from './services/Search/Search'
import { openEditor } from './services/Editor/Editor'
import { currentKeyboardShortcuts }
       from './services/KeyboardShortcuts/KeyboardShortcuts'
import { currentStatus } from './services/Status/Status'
import { currentErrors } from './services/Error/Error'
import { adminContext } from './services/AdminContext/AdminContext'
import { currentPreferences } from './services/Preferences/Preferences'

/**
 * initializeStore sets up the redux store
 *
 * @see See [redux](https://redux.js.org/)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const initializeStore = function() {
  // Create a top-level 'entities' redux reducer that groups together the
  // various entities as children.
  const entities = combineReducers({
    users: userEntities,
    projects: projectEntities,
    challenges: challengeEntities,
    virtualChallenges: virtualChallengeEntities,
    tasks: taskEntities,
    comments: commentEntities,
    places: placeEntities,
  })

  // redux root reducer defining the top-level reducers in the store
  const rootReducer = combineReducers({
      visibleLayer,
      visibleOverlays,
      currentUser,
      currentSearch,
      openEditor,
      currentKeyboardShortcuts,
      currentStatus,
      currentErrors,
      adminContext,
      currentPreferences,
      currentClusteredTasks,
      currentTaskClusters,
      currentBoundedTasks,
      currentReviewTasks,
      entities,
  })

  // Create the redux store, adding the thunk middleware so we can use
  // asynchronous action creators
  return createStore(
    rootReducer,
    undefined,
    applyMiddleware(thunk)
  )
}
