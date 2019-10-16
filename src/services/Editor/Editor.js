import geoViewport from '@mapbox/geo-viewport'
import _compact from 'lodash/compact'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import _find from 'lodash/find'
import _invert from 'lodash/invert'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import RequestStatus from '../Server/RequestStatus'
import AsMappableTask from '../../interactions/Task/AsMappableTask'
import AsMappableBundle from '../../interactions/TaskBundle/AsMappableBundle'
import AsIdentifiableFeature from '../../interactions/TaskFeature/AsIdentifiableFeature'
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
export const RAPID = 5

// Default editor choice if user has not selected an editor
export const DEFAULT_EDITOR = ID

// Reference to open editor window
let editorWindowReference = null

export const Editor = Object.freeze({
  none: NONE,
  id: ID,
  josm: JOSM,
  josmLayer: JOSM_LAYER,
  josmFeatures: JOSM_FEATURES,
  level0: LEVEL0,
  rapid: RAPID,
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
export const editTask = function(editor, task, mapBounds, options, taskBundle) {
  return function(dispatch) {
    if (isWebEditor(editor)) {
      // For web editors, if we've already opened an editor window, close it so
      // that we don't build up a bunch of open editor tabs and potentially
      // confuse users.
      if (editorWindowReference && !editorWindowReference.closed) {
        editorWindowReference.close()
      }

      if (editor === ID) {
        editorWindowReference = window.open(constructIdURI(task, mapBounds, options, taskBundle))
      }
      else if (editor === LEVEL0) {
        editorWindowReference = window.open(constructLevel0URI(task, mapBounds, options, taskBundle))
      }
      else if (editor === RAPID) {
        editorWindowReference = window.open(constructRapidURI(task, mapBounds, options))
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
          dispatch, editor, task, mapBounds, josmLoadObjectURI, taskBundle
        ).then(
          () => setTimeout(() => sendJOSMCommand(josmZoomURI(task, mapBounds)), 1000)
        )
      }
      else {
        openJOSM(dispatch, editor, task, mapBounds, josmLoadAndZoomURI, taskBundle)
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
  return editor === ID || editor === LEVEL0 || editor === RAPID
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
export const taskCenterPoint = function(mapBounds, task, taskBundle) {
  // For task bundles we currently ignore the mapBounds
  if (taskBundle) {
    return AsMappableBundle(taskBundle).calculateCenterPoint()
  }

  // If the mapbounds don't match the task, compute our own centerpoint.
  return (mapBounds && mapBounds.taskId === task.id) ?
         mapBounds.bounds.getCenter() :
         AsMappableTask(task).calculateCenterPoint()
}

/**
 * Builds a Id editor URI for editing of the given task
 */
export const constructIdURI = function(task, mapBounds, options, taskBundle) {
  const baseUriComponent =
    `${process.env.REACT_APP_ID_EDITOR_SERVER_URL}?editor=id`

  const centerPoint = taskCenterPoint(mapBounds, task, taskBundle)
  const mapUriComponent =
    "map=" + [mapBounds.zoom, centerPoint.lat, centerPoint.lng].join('/')

  // iD only supports a single selected entity, so don't bother passing bundle
  const selectedEntityComponent = osmObjectParams(task, false, '=', '&')
  const commentUriComponent = "comment=" +
                              encodeURIComponent(task.parent.checkinComment)
  const sourceComponent = "source=" + encodeURIComponent(task.parent.checkinSource)

  const photoOverlayComponent =
    _get(options, 'photoOverlay') ? "photo_overlay=" + options.photoOverlay : null;

  // Selected entity has to be included as normal URL param, but everything
  // else goes into the hash portion. See iD API documentation for details:
  // https://github.com/openstreetmap/iD/blob/master/API.md
  return (
    baseUriComponent +
    (!_isEmpty(selectedEntityComponent) ? `&${selectedEntityComponent}` : '') +
    '#' +
    _compact(
      [mapUriComponent, commentUriComponent, sourceComponent, photoOverlayComponent]
    ).join('&')
  )
}

/**
 * Builds a RapiD editor URI for editing of the given task
 */
export const constructRapidURI = function(task, mapBounds, options) {
  const baseUriComponent =
    `${process.env.REACT_APP_RAPID_EDITOR_SERVER_URL}#`

  const centerPoint = taskCenterPoint(mapBounds, task)
  const mapUriComponent =
    "map=" + [mapBounds.zoom, centerPoint.lat, centerPoint.lng].join('/')

  const selectedEntityComponent = "id=" + osmObjectParams(task, true)
  const commentUriComponent = "comment=" +
                              encodeURIComponent(task.parent.checkinComment)
  const sourceComponent = "source=" + encodeURIComponent(task.parent.checkinSource)

  const photoOverlayComponent =
    _get(options, 'photoOverlay') ? "photo_overlay=" + options.photoOverlay : null;

  return baseUriComponent + _compact(
    [selectedEntityComponent, commentUriComponent, sourceComponent,
      photoOverlayComponent, mapUriComponent]
  ).join('&')
}

/**
 * Builds a Level0 editor URI for editing of the given task
 */
export const constructLevel0URI = function(task, mapBounds, options, taskBundle) {
  const baseUriComponent =
    `${process.env.REACT_APP_LEVEL0_EDITOR_SERVER_URL}?`

  const centerPoint = taskCenterPoint(mapBounds, task, taskBundle)
  const mapCenterComponent =
    "center=" + [centerPoint.lat, centerPoint.lng].join(',')

  const commentComponent =
    "comment=" + encodeURIComponent(task.parent.checkinComment)

  const urlComponent = "url=" + osmObjectParams(_get(taskBundle, 'tasks', task), true)

  const result = baseUriComponent +
         [mapCenterComponent, commentComponent, urlComponent].join('&')
  return result
}

/**
 * Extracts osm identifiers from the given task's (or array of tasks) features
 * and returns them as a comma-separated string by default. Features with
 * missing osm ids are skipped, and an empty string is returned if the task has
 * no features or none of its features have osm ids
 *
 * To support varying formats required by different editors, the output string
 * can optionally be customized with options that control whether the entity
 * type is abbreviated or not, a separator character to be used between
 * the type and osm id, and the character used to join together multiple
 * entities
 */
export const osmObjectParams = function(task, abbreviated=false, entitySeparator='', joinSeparator=',') {
  const allTasks = _isArray(task) ? task : [ task ]
  let objects = []
  allTasks.forEach(task => {
    if (task.geometries && task.geometries.features) {
      objects = objects.concat(_compact(task.geometries.features.map(feature => {
        const osmId = AsIdentifiableFeature(feature).osmId()
        if (!osmId) {
          return null
        }

        switch (feature.geometry.type) {
          case 'Point':
            return `${abbreviated ? 'n' : 'node'}${entitySeparator}${osmId}`
          case 'LineString':
          case 'Polygon':
            return `${abbreviated ? 'w' : 'way'}${entitySeparator}${osmId}`
          case 'MultiPolygon':
            return `${abbreviated ? 'r' : 'relation'}${entitySeparator}${osmId}`
          default:
            return null
        }
      })))
    }
  })

  return objects.join(joinSeparator)
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
export const josmBoundsParams = function(task, mapBounds, taskBundle) {
  let bounds = null
  if (taskBundle) {
    // For task bundles, we currently ignore map bounds
    bounds = toLatLngBounds(AsMappableBundle(taskBundle).calculateBBox())
  }
  else if (mapBounds.taskId !== task.id) {
    // If the mapbounds don't match the task, compute our own bounds
    bounds = toLatLngBounds(AsMappableTask(task).calculateBBox())
  }
  else {
    bounds = mapBounds.bounds
  }

  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  return `left=${sw.lng}&right=${ne.lng}&top=${ne.lat}&bottom=${sw.lat}`
}

/**
 * Generate appropriate JOSM editor URI layer params for setting up a new layer, if
 * desired, as well as naming the layer
 */
export const josmLayerParams = function(task, asNewLayer, taskBundle) {
  const newLayer = asNewLayer ? 'true' : 'false'
  const layerName = taskBundle ?
                    `MR Bundle ${task.id} (${taskBundle.tasks.length} tasks)` :
                    `MR Task ${task.id}`

  return `new_layer=${newLayer}&layer_name=${encodeURIComponent(layerName)}`
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
export const josmLoadAndZoomURI = function(dispatch, editor, task, mapBounds, taskBundle) {
  return josmHost() + 'load_and_zoom?' + [
    josmBoundsParams(task, mapBounds, taskBundle),
    josmLayerParams(task, editor === JOSM_LAYER, taskBundle),
    josmChangesetParams(task),
    `select=${osmObjectParams(_get(taskBundle, 'tasks', task))}`
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
export const josmLoadObjectURI = function(dispatch, editor, task, mapBounds, taskBundle) {
  const objects = osmObjectParams(_get(taskBundle, 'tasks', task))

  // We can't load objects if there are none. This is usually because the
  // task features are missing OSM ids
  if (objects.length === 0) {
    dispatch(addError(AppErrors.josm.missingOSMIds))
    dispatch(editorOpened(editor, task.id, RequestStatus.error))
    return null
  }

  return josmHost() + 'load_object?' + [
    josmBoundsParams(task, mapBounds, taskBundle),
    josmLayerParams(task, true, taskBundle),
    josmChangesetParams(task),
    `objects=${objects}`
  ].join('&')
}

/**
 * Sends a command to JOSM and returns a promise that resolves to true on
 * success, false on failure
 */
export const sendJOSMCommand = function(uri) {
  // Safari won't send AJAX commands to the default (insecure) JOSM port when
  // on a secure site, and the secure JOSM port uses a self-signed certificate
  // that requires the user to jump through a bunch of hoops to trust before
  // communication can proceed. So for Safari only, fall back to sending JOSM
  // requests via the opening of a separate window instead of AJAX
  if (window.safari) {
    return new Promise((resolve, reject) => {
      if (editorWindowReference && !editorWindowReference.closed) {
        editorWindowReference.close()
      }

      editorWindowReference = window.open(uri)

      // Close the window after 1 second and resolve the promise
      setTimeout(() => {
        if (editorWindowReference && !editorWindowReference.closed) {
          editorWindowReference.close()
        }
        resolve(true)
      }, 1000)
    })
  }

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
const openJOSM = function(dispatch, editor, task, mapBounds, josmURIFunction, taskBundle) {
  const uri = josmURIFunction(dispatch, editor, task, mapBounds, taskBundle)
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
 * Load the given objects into JOSM
 */
export const loadObjectsIntoJOSM = function(objectIds, asNewLayer) {
  const objectIdString = objectIds.join(',')
  let josmURI = `${josmHost()}load_object?objects=${objectIdString}&layer_name=${objectIdString}`
  if (asNewLayer) {
    josmURI += "&new_layer=true"
  }

  return sendJOSMCommand(josmURI)
}

/**
 * Zoom JOSM to the given bounding box
 */
export const zoomJOSM = function(bbox) {
  const bounds = `left=${bbox[0]}&bottom=${bbox[1]}&right=${bbox[2]}&top=${bbox[3]}`
  const josmURI = `${josmHost()}zoom?${bounds}`

  return sendJOSMCommand(josmURI)
}

/**
 * Computes a bbox from the given zoom, lat, lon, and target viewport size
 */
export const viewportToBBox = function(zoom, lat, lon, viewportWidth, viewportHeight) {
  return geoViewport.bounds([lon, lat], zoom, [viewportWidth, viewportHeight])
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
