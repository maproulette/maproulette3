import _compact from 'lodash/compact'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import RequestStatus from '../Server/RequestStatus'
import { buildError, addError } from '../Error/Error'
import messages from './Messages'

// Editor constants defined on server
export const NONE = -1
export const ID = 0
export const JOSM = 1
export const JOSM_LAYER = 2

// Reference to open editor window
let editorWindowReference = null

export const Editor = Object.freeze({
  none: NONE,
  id: ID,
  josm: JOSM,
  josmLayer: JOSM_LAYER,
})

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
    if (editor === ID) {
      // If we've already opened an editor window, close it so that we don't
      // build up a bunch of open editor tabs, potentially confusing users.
      if (editorWindowReference && !editorWindowReference.closed) {
        editorWindowReference.close()
      }

      editorWindowReference = window.open(constructIdURI(task, mapBounds))

      dispatch(editorOpened(editor, task.id, RequestStatus.success))
    }
    else if (editor === JOSM || editor === JOSM_LAYER) {
      openJOSM(dispatch,
               editor,
               task,
               constructJosmURI(editor === JOSM_LAYER, task, mapBounds))
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

export const constructIdURI = function(task, mapBounds) {
  const baseUriComponent =
    `${process.env.REACT_APP_ID_EDITOR_SERVER_URL}?editor=id#`

  const centerPoint = mapBounds.bounds.getCenter()
  const mapUriComponent =
    "map=" + [mapBounds.zoom, centerPoint.lat, centerPoint.lng].join('/')

  const featureStrings = _compact(task.geometries.features.map((feature) => {
    const osmId = featureOSMId(feature)
    if (!osmId) {
      return null
    }

    switch (feature.geometry.type) {
      case 'Point':
        return `n${osmId}`
      case 'LineString':
        return `w${osmId}`
      case 'Polygon':
        return `w${osmId}`
      case 'MultiPolygon':
        return `r${osmId}`
      default:
        return null
    }
	}))

  const idUriComponent = "id=" + featureStrings.join(',')
  const commentUriComponent = "comment=" + encodeURI(task.parent.checkinComment)

  return baseUriComponent +
         [idUriComponent, mapUriComponent, commentUriComponent].join('&')
}

/**
 * Builds a URI for the JOSM Remote Control plugin to load the given task
 * features and zoom to the given map bounds.
 *
 * @see See https://wiki.openstreetmap.org/wiki/JOSM/RemoteControl
 */
export const constructJosmURI = function(asNewLayer = false, task, mapBounds) {
  const sw = mapBounds.bounds.getSouthWest()
  const ne = mapBounds.bounds.getNorthEast()
  let uri = `http://127.0.0.1:8111/load_and_zoom?left=${sw.lng}&right=${ne.lng}` +
            `&top=${ne.lat}&bottom=${sw.lat}&new_layer=${asNewLayer ? 'true' : 'false'}` +
            `&changeset_comment=${encodeURI(task.parent.checkinComment)}&select=`

  let selects = []
  if (task.geometries && task.geometries.features) {
    selects = _compact(task.geometries.features.map((feature) => {
      const osmId = featureOSMId(feature)
      if (!osmId) {
        return null
      }

      switch (feature.geometry.type) {
        case 'Point':
          return `node${osmId}`
        case 'LineString':
          return `way${osmId}`
        case 'Polygon':
          return `way${osmId}`
        case 'MultiPolygon':
          return `relation${osmId}`
        default:
          return null
      }
    }))
  }

  return uri + selects.join(',')
}

const openJOSM = function(dispatch, editor, task, uri) {
  fetch(uri).then((response) => {
    if (response.status === 200) {
      dispatch(editorOpened(editor, task.id, RequestStatus.success))
    }
    else {
      dispatch(addError(buildError(
        "JOSM.noResponse",
        "OSM remote control did not respond. Do you have JOSM running with Remote Control enabled?"
      )))
      dispatch(editorOpened(editor, task.id, RequestStatus.error))
    }
  }).catch((error) => {
    dispatch(addError(buildError(
      "JOSM.noResponse",
      "OSM remote control did not respond. Do you have JOSM running with Remote Control enabled?"
    )))
    dispatch(editorOpened(editor, task.id, RequestStatus.error))
  })
}

/**
 * Return an OSM id for the given feature, if available. Right
 * now we support `osmid` and `@id` properties on the feature.
 */
export const featureOSMId = function(feature) {
  if (!feature.properties) {
    return null
  }

  if (feature.properties.osmid) {
    return feature.properties.osmid
  }
  else if (feature.properties['@id']) {
    // The @id property will often contain a representation of the feature type
    // prior to the numerical id, which we strip out as different editors may
    // expect different representations.
    const match = /[^\d]*(\d+)$/.exec(feature.properties['@id'])
    return (match && match.length > 1) ? match[1] : null
  }
}
