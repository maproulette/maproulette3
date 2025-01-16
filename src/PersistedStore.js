import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { adminContext } from "./services/AdminContext/AdminContext";
import { adminChallengeEntities, challengeEntities } from "./services/Challenge/Challenge";
import { commentEntities } from "./services/Comment/Comment";
import { openEditor } from "./services/Editor/Editor";
import { currentErrors } from "./services/Error/Error";
import { currentKeyboardShortcuts } from "./services/KeyboardShortcuts/KeyboardShortcuts";
import { placeEntities } from "./services/Place/Place";
import { currentPreferences } from "./services/Preferences/Preferences";
import { projectEntities } from "./services/Project/Project";
import { rapidEditor } from "./services/RapidEditor/RapidEditor";
import { currentSearch } from "./services/Search/Search";
import { currentStatus } from "./services/Status/Status";
import { adminProjectEntities } from "./services/SuperAdmin/SuperAdminProjects";
import { adminUserEntities } from "./services/SuperAdmin/SuperAdminUsers";
import { currentBoundedTasks } from "./services/Task/BoundedTask";
import { currentClusteredTasks } from "./services/Task/ClusteredTask";
import { taskEntities } from "./services/Task/Task";
import { currentTaskClusters } from "./services/Task/TaskClusters";
import { currentReviewTasks } from "./services/Task/TaskReview/TaskReview";
import { currentUser, userEntities } from "./services/User/User";
import { virtualChallengeEntities } from "./services/VirtualChallenge/VirtualChallenge";
import { visibleLayer } from "./services/VisibleLayer/VisibleLayer";
import { visibleOverlays } from "./services/VisibleLayer/VisibleOverlays";

/**
 * initializeStore sets up the redux store
 *
 * @see See [redux](https://redux.js.org/)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const initializeStore = function () {
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
    adminChallenges: adminChallengeEntities,
    adminProjects: adminProjectEntities,
    adminUsers: adminUserEntities,
  });

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
    rapidEditor,
  });

  // Create the redux store, adding the thunk middleware so we can use
  // asynchronous action creators
  return createStore(rootReducer, undefined, applyMiddleware(thunk));
};
