import { compact as _compact } from 'lodash'
import RequestStatus from '../Server/RequestStatus'
import { buildError, addError } from '../Error/Error'

// Editor constants defined on server
export const NONE = -1
export const ID = 0
export const JOSM = 1
export const JOSM_LAYER = 2

export const Editor = Object.freeze({
  none: NONE,
  id: ID,
  josm: JOSM,
  josmLayer: JOSM_LAYER,
})

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
      window.open(constructIdURI(task, mapBounds))
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

const constructIdURI = function(task, mapBounds) {
  const baseUriComponent =
    `${process.env.REACT_APP_ID_EDITOR_SERVER_URL}?editor=id#`

  const centerPoint = mapBounds.bounds.getCenter()
  const mapUriComponent =
    "map=" + [mapBounds.zoom, centerPoint.lat, centerPoint.lng].join('/')

  const featureStrings = _compact(task.geometries.features.map((feature) => {
    if (!feature.properties.osmid) {
      return null
    }

    switch (feature.geometry.type) {
      case 'Point':
        return `n${feature.properties.osmid}`
      case 'LineString':
        return `w${feature.properties.osmid}`
      case 'Polygon':
        return `w${feature.properties.osmid}`
      case 'MultiPolygon':
        return `r${feature.properties.osmid}`
      default:
        return null
    }
	}))

  const idUriComponent = "id=" + featureStrings.join(',')
  const commentUriComponent = "comment=" + encodeURI(task.parent.checkinComment)

  return baseUriComponent +
         [idUriComponent, mapUriComponent, commentUriComponent].join('&')
}

const constructJosmURI = function(asNewLayer = false, task, mapBounds) {
  const sw = mapBounds.bounds.getSouthWest()
  const ne = mapBounds.bounds.getNorthEast()
  let uri = `http://127.0.0.1:8111/load_and_zoom?left=${sw.lng}&right=${ne.lng}` +
            `&top=${ne.lat}&bottom=${sw.lat}&new_layer=${asNewLayer ? 'true' : 'false'}` +
            `&changeset_comment=${encodeURI(task.parent.checkinComment)}&select=`

  let selects = []
  if (task.geometries && task.geometries.features) {
    selects = _compact(task.geometries.features.map((feature) => {
      if (!feature.properties.osmid) {
        return null
      }

      switch (feature.geometry.type) {
        case 'Point':
          return `node${feature.properties.osmid}`
        case 'LineString':
          return `way${feature.properties.osmid}`
        case 'Polygon':
          return `way${feature.properties.osmid}`
        case 'MultiPolygon':
          return `relation${feature.properties.osmid}`
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
