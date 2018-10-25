import uuidv4 from 'uuid/v4'
import _isFinite from 'lodash/isFinite'

export const CURRENT_DATAMODEL_VERSION=1

export const DASHBOARD_DATA_TARGET_PROJECTS = 'projects'
export const DASHBOARD_DATA_TARGET_PROJECT = 'project'
export const DASHBOARD_DATA_TARGET_CHALLENGES = 'challenges'
export const DASHBOARD_DATA_TARGET_CHALLENGE = 'challenge'
export const DASHBOARD_DATA_TARGET_TASKS = 'tasks'
export const DASHBOARD_DATA_TARGET_TASK = 'task'

export const DashboardDataTarget = {
  projects: DASHBOARD_DATA_TARGET_PROJECTS,
  project: DASHBOARD_DATA_TARGET_PROJECT,
  challenges: DASHBOARD_DATA_TARGET_CHALLENGES,
  challenge: DASHBOARD_DATA_TARGET_CHALLENGE,
  tasks: DASHBOARD_DATA_TARGET_TASKS,
  task: DASHBOARD_DATA_TARGET_TASK,
}

export const generateDashboardId = function() {
  return uuidv4()
}

export const migrateDashboard = function(configuration, generateDefaultConfiguration) {
  // Dashboards lacking any version number cannot be migrated. Reset to
  // default configuration.
  if (!_isFinite(configuration.dataModelVersion)) {
    return Object.assign(generateDefaultConfiguration(), {
      id: configuration.id,
      label: configuration.label,
    })
  }

  // No migrations yet
  return configuration
}
