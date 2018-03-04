import { combineReducers, createStore, applyMiddleware } from 'redux'
import { persistStore, persistReducer, createMigrate } from 'redux-persist'
import thunk from 'redux-thunk'
import localForage from 'localforage'
import _has from 'lodash/has'
import { visibleLayer } from './services/VisibleLayer/VisibleLayer'
import { currentUser, userEntities } from './services/User/User'
import { projectEntities } from './services/Project/Project'
import { challengeEntities } from './services/Challenge/Challenge'
import { virtualChallengeEntities }
       from './services/VirtualChallenge/VirtualChallenge'
import { taskEntities } from './services/Task/Task'
import { currentClusteredTasks } from './services/Task/ClusteredTask'
import { currentBoundedTasks } from './services/Task/BoundedTask'
import { commentEntities } from './services/Comment/Comment'
import { placeEntities } from './services/Place/Place'
import { currentFilters } from './services/Filter/Filter'
import { currentSearch } from './services/Search/Search'
import { openEditor } from './services/Editor/Editor'
import { currentMapBounds } from './services/MapBounds/MapBounds'
import { currentKeyboardShortcuts }
       from './services/KeyboardShortcuts/KeyboardShortcuts'
import { currentStatus } from './services/Status/Status'
import { currentErrors } from './services/Error/Error'
import { adminContext } from './services/AdminContext/AdminContext'
import { currentPreferences } from './services/Preferences/Preferences'

const DATA_MODEL_VERSION = 6

/**
 * initializePersistedStore sets up the redux store in combination with
 * redux-persist so that it'll be persisted to local storage. The redux store
 * is initially hydrated from local storage when the application is fired up on
 * subsequent sessions, and the given callback will be invoked after hydration
 * is complete.
 *
 * Data migrations are included for migrating existing persisted stores to new
 * versions of the data model, when feasible, so that the data need not be
 * discarded each time the data model is updated.
 *
 * @param {function} callback - invoked after hydration is complete
 *
 * @see See [redux](https://redux.js.org/)
 * @see See [redux-persist](https://github.com/rt2zz/redux-persist)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const initializePersistedStore = callback => {
  // Migrations. Each key is a version number of the data model
  const dataMigrations = {
    3: state => {
      // reset challenges to ensure parent projects are available
      if (state.entities) {
        state.entities.challenges = {}
        state.entities.tasks = {}
      }

      return state
    },
    4: state => {
      delete state.metrics
      delete state.currentTask
      delete state.currentAppMode

      return state
    },
    5: state => {
      // Rename 'tags' filter to 'keywords' filter
      if (_has(state, 'currentFilters.challenge.tags')) {
        state.currentFilters.challenge.keywords =
          state.currentFilters.challenge.tags
        delete state.currentFilters.challenge.tags
      }

      return state
    },
    6: state => {
      // Reset visibleLayer
      delete state.visibleLayer

      // Ensure now-blacklisted fields are reset
      delete state.currentStatus
      delete state.currentErrors
      delete state.openEditor
      delete state.currentKeyboardShortcuts
      delete state.currentClusteredTasks

      return state
    }
  }

  // redux-persist config object. For explanation of options, see:
  // https://github.com/rt2zz/redux-persist/blob/master/docs/api.md#type-persistconfig
  const persistenceConfig = {
    key: 'mr-react',
    storage: localForage,
    version: DATA_MODEL_VERSION,
    migrate: createMigrate(dataMigrations, { debug: false }),
    debug: false,
    blacklist: [ // don't persist
      'currentStatus',
      'currentErrors',
      'openEditor',
      'currentKeyboardShortcuts',
      'currentClusteredTasks',
      'currentBoundedTasks',
    ],
  }

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
      currentUser,
      currentFilters,
      currentSearch,
      openEditor,
      currentMapBounds,
      currentKeyboardShortcuts,
      currentStatus,
      currentErrors,
      adminContext,
      currentPreferences,
      currentClusteredTasks,
      currentBoundedTasks,
      entities,
  })

  // Create the redux store, wrapping the root reducer with a persistReducer.
  // Add the thunk middleware so we can use asynchronous action creators.
  const store = createStore(
    persistReducer(persistenceConfig, rootReducer),
    undefined,
    applyMiddleware(thunk)
  )

  // Initialize redux-persist. Callback is invoked after store
  // has been hydrated from local storage.
  const persistor = persistStore(store, undefined, () => callback(store))

  return {store, persistor}
}
