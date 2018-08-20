import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import messages from './Messages'

export const PROJECT_FILTER_VISIBLE = 'visible'
export const PROJECT_FILTER_OWNER = 'owner'
export const PROJECT_FILTER_PINNED = 'pinned'

export const ProjectFilter = {
  visible: PROJECT_FILTER_VISIBLE,
  owner: PROJECT_FILTER_OWNER,
  pinned: PROJECT_FILTER_PINNED,
}

export const defaultProjectFilters = function() {
  return {
    [PROJECT_FILTER_VISIBLE]: false,
    [PROJECT_FILTER_OWNER]: false,
    [PROJECT_FILTER_PINNED]: false,
  }
}

export const projectPassesFilters = function(project, manager, pins, projectFilters) {
  if (projectFilters.visible && !project.enabled) {
    return false
  }

  if (projectFilters.owner && !manager.isProjectOwner(project)) {
    return false
  }

  if (projectFilters.pinned && pins.indexOf(project.id) === -1) {
    return false
  }

  return true
}

/**
 * Returns an object mapping project filters to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByFilter = _fromPairs(
  _map(messages, (message, key) => [ProjectFilter[key], message])
)
