import _compact from 'lodash/compact'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import _find from 'lodash/find'
import _invert from 'lodash/invert'
import RequestStatus from '../Server/RequestStatus'
import AsMappableTask from '../../interactions/Task/AsMappableTask'
import { toLatLngBounds  } from '../MapBounds/MapBounds'
import { addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import messages from './Messages'

// Editor option constants based on constants defined on server
export const NONE = -1
export const ID = 0
export const JOSM = 1
export const JOSM_LAYER = 2
export const LEVEL0 = 3
export const JOSM_FEATURES = 4

// Default editor choice if user has not selected an editor
export const DEFAULT_EDITOR = ID

/**
 * Supported names of properties used to identify an OSM entity associated with
 * a feature.
 */
export const osmIdentifierFields = ['osmid', 'id', '@id', 'osmIdentifier']

// Reference to open editor window
let editorWindowReference = null

export const Editor = Object.freeze({
  none: NONE,
  id: ID,
  josm: JOSM,
  josmLayer: JOSM_LAYER,
  josmFeatures: JOSM_FEATURES,
  level0: LEVEL0,
})


export const keysByEditor = Object.freeze(_invert(Editor))

/** Returns object containing localized labels  */
export const editorLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

// redux actions
export const EDITOR_OPENED = 'EditorOpened'
export const EDITOR_CLOSED = 'EditorClosed'

// redux action creators
export const editorOpened = function(editor, taskId, status=RequestStatus.success) {
  return {
    type: EDITOR_OPENED,
    editor,
    taskId,
    status,
  }
}

// async action creators
export const editTask = function(editor, task, mapBounds) {
  return function(dispatch) {
    if (isWebEditor(editor)) {
      // For web editors, if we've already opened an editor window, close it so
      // that we don't build up a bunch of open editor tabs and potentially
      // confuse users.
      if (editorWindowReference && !editorWindowReference.closed) {
        editorWindowReference.close()
      }

      if (editor === ID) {
        editorWindowReference = window.open(constructIdURI(task, mapBounds))
      }
      else if (editor === LEVEL0) {
        editorWindowReference = window.open(constructLevel0URI(task, mapBounds))
      }

      dispatch(editorOpened(editor, task.id, RequestStatus.success))
    }
    else if (isJosmEditor(editor)) {
      if (editor === JOSM_FEATURES) {
        // Load the features, then zoom JOSM to the task map's bounding box.
        // Otherwise if there are long features like a highway, the user could
        // end up zoomed way out by default. We have to do this as two separate
        // calls to JOSM, with a bit of a delay to give JOSM the chance to load
        // the object before we try to zoom
        openJOSM(
          dispatch, editor, task, mapBounds, josmLoadObjectURI
        ).then(
          () => setTimeout(() => sendJOSMCommand(josmZoomURI(task, mapBounds)), 1000)
        )
      }
      else {
        openJOSM(dispatch, editor, task, mapBounds, josmLoadAndZoomURI)
      }
    }
  }
}

export const closeEditor = function() {
  return {
    type: EDITOR_CLOSED,
  }
}

// redux reducers
export const openEditor = function(state=null, action) {
  if (action.type === EDITOR_OPENED) {
    return {
      name: action.editor,
      taskId: action.taskId,
      success: action.status === RequestStatus.success,
    }
  }
  else if (action.type === EDITOR_CLOSED) {
    return null
  }
  else {
    return state
  }
}

// Helper functions

/**
 * Returns true if the given editor option represents a web editor, false
 * otherwise
 */
export const isWebEditor = function(editor) {
  return editor === ID || editor === LEVEL0
}

/**
 * Returns true if the given editor option represents a variant of the
 * JOSM editor, false if not
 */
export const isJosmEditor = function(editor) {
  return editor === JOSM || editor === JOSM_LAYER || editor === JOSM_FEATURES
}

/**
 * Returns the centerpoint of the given mapBounds if they are for the
 * given task, or else computes and returns the task's centerpoint
 */
export const taskCenterPoint = function(mapBounds, task) {
  // If the mapbounds don't match the task, compute our own centerpoint.
  return (mapBounds && mapBounds.taskId === task.id) ?
         mapBounds.bounds.getCenter() :
         AsMappableTask(task).calculateCenterPoint()
}

/**
 * Builds a Id editor URI for editing of the given task
 */
export const constructIdURI = function(task, mapBounds) {
  const baseUriComponent =
    `${process.env.REACT_APP_ID_EDITOR_SERVER_URL}?editor=id#`

  const centerPoint = taskCenterPoint(mapBounds, task)
  const mapUriComponent =
    "map=" + [mapBounds.zoom, centerPoint.lat, centerPoint.lng].join('/')

  const idUriComponent = "id=" + osmObjectParams(task, true)
  const commentUriComponent = "comment=" +
                              encodeURIComponent(task.parent.checkinComment)

  return baseUriComponent +
         [idUriComponent, mapUriComponent, commentUriComponent].join('&')
}

/**
 * Builds a Level0 editor URI for editing of the given task
 */
export const constructLevel0URI = function(task, mapBounds) {
  const baseUriComponent =
    `${process.env.REACT_APP_LEVEL0_EDITOR_SERVER_URL}?`

  const centerPoint = taskCenterPoint(mapBounds, task)
  const mapCenterComponent =
    "center=" + [centerPoint.lat, centerPoint.lng].join(',')

  const commentComponent =
    "comment=" + encodeURIComponent(task.parent.checkinComment)

  const urlComponent = "url=" + osmObjectParams(task, true)

  return baseUriComponent +
         [mapCenterComponent, commentComponent, urlComponent].join('&')
}

/**
 * Extracts osm identifiers from the given task's features and returns
 * them as a comma-separated string. Features with missing osm ids are
 * skipped, and an empty string is returned if the task has no features
 * or none of its features have osm ids
 */
export const osmObjectParams = function(task, abbreviated=false) {
  let objects = []
  if (task.geometries && task.geometries.features) {
    objects = _compact(task.geometries.features.map(feature => {
      const osmId = featureOSMId(feature)
      if (!osmId) {
        return null
      }

      switch (feature.geometry.type) {
        case 'Point':
          return `${abbreviated ? 'n' : 'node'}${osmId}`
        case 'LineString':
        case 'Polygon':
          return `${abbreviated ? 'w' : 'way'}${osmId}`
        case 'MultiPolygon':
          return `${abbreviated ? 'r' : 'relation'}${osmId}`
        default:
          return null
      }
    }))
  }

  return objects.join(',')
}

/**
 * Return the JOSM editor host
 */
export const josmHost = function() {
  return 'http://127.0.0.1:8111/'
}

/**
 * Generate appropriate JOSM editor URI bbox params based on the given
 * mapBounds, if they match the task, or else the computed bbox from the task
 * itself
 */
export const josmBoundsParams = function(task, mapBounds) {
  // If the mapbounds don't match the task, compute our own bounds.
  const bounds = mapBounds.taskId === task.id ?
                 mapBounds.bounds :
                 toLatLngBounds(AsMappableTask(task).calculateBBox())

  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return `left=${sw.lng}&right=${ne.lng}&top=${ne.lat}&bottom=${sw.lat}`
}

/**
 * Generate appropriate JOSM editor URI layer params for setting up a new layer, if
 * desired, as well as naming the layer
 */
export const josmLayerParams = function(task, asNewLayer) {
  return `new_layer=${asNewLayer ? 'true' : 'false'}&` +
         `layer_name=${encodeURIComponent("Maproulette Task " + task.id)}`
}

/**
 * Generate appropriate JOSM editor URI changeset params with the comment
 * and source from the given task's challenge
 */
export const josmChangesetParams = function(task) {
  return `changeset_comment=${encodeURIComponent(task.parent.checkinComment)}` +
         `&changeset_source=${encodeURIComponent(task.parent.checkinSource)}`
}

/*
 * Builds a URI for the JOSM load_and_zoom remote control command
 *
 * @see See https://josm.openstreetmap.de/wiki/Help/RemoteControlCommands#load_and_zoom
 */
export const josmLoadAndZoomURI = function(dispatch, editor, task, mapBounds) {
  return josmHost() + 'load_and_zoom?' + [
    josmBoundsParams(task, mapBounds),
    josmLayerParams(task, editor === JOSM_LAYER),
    josmChangesetParams(task),
    `select=${osmObjectParams(task)}`
  ].join('&')
}

/*
 * Builds a URI for the JOSM zoom remote control command
 *
 * @see See https://josm.openstreetmap.de/wiki/Help/RemoteControlCommands#zoom
 */
export const josmZoomURI = function(task, mapBounds) {
  return josmHost() + 'zoom?' + josmBoundsParams(task, mapBounds)
}

/*
 * Builds a URI for the JOSM load_object remote control command, useful for loading
 * just a task's features. If the task contains no features with OSM identifiers
 * then an error is dispatched and null is returned
 *
 * @see See https://josm.openstreetmap.de/wiki/Help/RemoteControlCommands#load_object
 */
export const josmLoadObjectURI = function(dispatch, editor, task, mapBounds) {
  const objects = osmObjectParams(task)

  // We can't load objects if there are none. This is usually because the
  // task features are missing OSM ids
  if (objects.length === 0) {
    dispatch(addError(AppErrors.josm.missingOSMIds))
    dispatch(editorOpened(editor, task.id, RequestStatus.error))
    return null
  }

  return josmHost() + 'load_object?' + [
    josmBoundsParams(task, mapBounds),
    josmLayerParams(task, true),
    josmChangesetParams(task),
    `objects=${objects}`
  ].join('&')
}

/**
 * Sends a command to JOSM and returns a promise that resolves to true on
 * success, false on failure
 */
export const sendJOSMCommand = function(uri) {
  return fetch(uri).then(
    response => response.status === 200
  ).catch(error => {
    console.log(error)
    return false
  })
}

/**
 * Execute an ajax request to open the JOSM editor. The given josmURIFunction
 * will be invoked to generate the remote-control command URI
 */
const openJOSM = function(dispatch, editor, task, mapBounds, josmURIFunction) {
  const uri = josmURIFunction(dispatch, editor, task, mapBounds)
  if (!uri) {
    return Promise.resolve()
  }

  return sendJOSMCommand(uri).then(success => {
    if (success) {
      return dispatch(editorOpened(editor, task.id, RequestStatus.success))
    }
    else {
      dispatch(addError(AppErrors.josm.noResponse))
      return dispatch(editorOpened(editor, task.id, RequestStatus.error))
    }
  })
}

/**
 * Retrieve an OSM identifier for the given task feature, if available
 */
export const featureOSMId = function(feature) {
  // Identifiers can live on the feature itself or as a property
  const osmId = firstTruthyValue(feature, osmIdentifierFields) ||
                firstTruthyValue(feature.properties, osmIdentifierFields)

  if (!osmId) {
    return null
  }

  // id properties may contain additional information, such as a representation
  // of the feature type. We want to return just the the numerical OSM id
  const match = /(\d+)/.exec(osmId)
  return (match && match.length > 1) ? match[1] : null
}

/**
 * Returns the first truthy value from the given object that is encountered a
 * given acceptable key, which are attempted in order. If no truthy values are
 * found, or if the given object is null/undefined, then undefined is returned.
 */
export const firstTruthyValue = function(object, acceptableKeys) {
  if (!object) {
    return undefined
  }

  const matchingKey = _find(acceptableKeys, key => object[key])
  return matchingKey ? object[matchingKey] : undefined
}
