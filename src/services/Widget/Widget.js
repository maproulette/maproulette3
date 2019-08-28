import uuidv4 from 'uuid/v4'
import FileSaver from 'file-saver'
import _isFinite from 'lodash/isFinite'
import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _intersection from 'lodash/intersection'
import _cloneDeep from 'lodash/cloneDeep'
import _isString from 'lodash/isString'
import _findIndex from 'lodash/findIndex'
import _each from 'lodash/each'
import _reduce from 'lodash/reduce'
import _pick from 'lodash/pick'
import _snakeCase from 'lodash/snakeCase'
import _find from 'lodash/find'
import GridMigrations from './GridMigrations'

/**
 * Current version of the widget grid configuration data model. Be sure to add
 * a migration to GridMigrations.js when bumping this up to a newer version.
 */
export const CURRENT_DATAMODEL_VERSION=2

export const WIDGET_DATA_TARGET_PROJECTS = 'projects'
export const WIDGET_DATA_TARGET_PROJECT = 'project'
export const WIDGET_DATA_TARGET_CHALLENGES = 'challenges'
export const WIDGET_DATA_TARGET_CHALLENGE = 'challenge'
export const WIDGET_DATA_TARGET_TASKS = 'tasks'
export const WIDGET_DATA_TARGET_TASK = 'task'
export const WIDGET_DATA_TARGET_USER = 'user'
export const WIDGET_DATA_TARGET_REVIEW = 'review'

export const WIDGET_USER_TARGET_ALL = 'all'
export const WIDGET_USER_TARGET_MANAGER_READ = 'managerRead'
export const WIDGET_USER_TARGET_MANAGER_WRITE = 'managerWrite'
export const WIDGET_USER_TARGET_SUPERUSER = 'superuser'

export const WidgetDataTarget = {
  projects: WIDGET_DATA_TARGET_PROJECTS,
  project: WIDGET_DATA_TARGET_PROJECT,
  challenges: WIDGET_DATA_TARGET_CHALLENGES,
  challenge: WIDGET_DATA_TARGET_CHALLENGE,
  tasks: WIDGET_DATA_TARGET_TASKS,
  task: WIDGET_DATA_TARGET_TASK,
  user: WIDGET_DATA_TARGET_USER,
  review: WIDGET_DATA_TARGET_REVIEW
}

export const WidgetUserTarget = {
  all: WIDGET_USER_TARGET_ALL,
  managerRead: WIDGET_USER_TARGET_MANAGER_READ,
  managerWrite: WIDGET_USER_TARGET_MANAGER_WRITE,
  superuser: WIDGET_USER_TARGET_SUPERUSER,
}

/**
 * Registered widget types with descriptors.
 *
 * @private
 */
const WidgetTypes = {}

/**
 * Register a new widget type with the given component (which should be
 * pre-wrapped with any needed higher-order components) and widget descriptor.
 */
export const registerWidgetType = function(widgetComponent, widgetDescriptor) {
  if (!widgetDescriptor) {
    throw new Error("Cannot register widget type without descriptor")
  }

  if (!widgetDescriptor.widgetKey) {
    throw new Error("Cannot register widget type without descriptor.widgetKey")
  }

  WidgetTypes[widgetDescriptor.widgetKey || widgetDescriptor.widgetKey] = {
    descriptor: widgetDescriptor,
    component: widgetComponent
  }
}

/**
 * Retrieves the descriptor for the widget identified by the given key, or null
 * if no widget is found.
 */
export const widgetDescriptor = function(widgetKey) {
  return WidgetTypes[widgetKey] ? WidgetTypes[widgetKey].descriptor : null
}

/**
 * Looks up a widget component from either the given widgetKey (string) or widget
 * descriptor (object) containing a `widgetKey` field. Returns null if no
 * matching component is found.
 */
export const widgetComponent = function(keyOrDescriptor) {
  const widgetKey = _isObject(keyOrDescriptor) ?
                    keyOrDescriptor.widgetKey :
                    keyOrDescriptor

  return WidgetTypes[widgetKey] ? WidgetTypes[widgetKey].component : null
}

/**
 * Returns an array of descriptors for widget types that have data targets
 * compatible with the given dataTargets.
 */
export const compatibleWidgetTypes = function(dataTargets) {
  return _compact(_map(WidgetTypes, widgetInfo => (
    _intersection(dataTargets, widgetInfo.descriptor.targets).length === 0 ?
    null :
    widgetInfo.descriptor
  )))
}

/**
 * Generate a new random id for a widget grid
 */
export const generateWidgetId = function() {
  return uuidv4()
}

/**
 * Resets the given configuration back to the default, preserving its id
 * and user-assigned label
 */
export const resetGridConfigurationToDefault = function(configuration, generateDefaultConfiguration) {
  return Object.assign(generateDefaultConfiguration(), {
    id: configuration.id,
    label: configuration.label,
  })
}

/**
 * Migrate a given widget grid configuration format to the latest format if
 * needed and possible. Returns the migrated configuration, or a fresh default
 * configuration if migration is not possible.
 */
export const migrateWidgetGridConfiguration = function(originalConfiguration,
                                                       generateDefaultConfiguration) {
  // Grids lacking any version number cannot be migrated. Reset to default
  // configuration.
  if (!_isFinite(originalConfiguration.dataModelVersion)) {
    return resetGridConfigurationToDefault(originalConfiguration,
                                           generateDefaultConfiguration)
  }

  let migratedConfiguration = null
  let version = originalConfiguration.dataModelVersion

  while (version < CURRENT_DATAMODEL_VERSION) {
    if (!GridMigrations[version]) {
      throw new Error(`Unable to migrate widget grid configuration from version ${version}: no migration found`)
    }

    // Create a configuration copy if we haven't already
    if (!migratedConfiguration) {
      migratedConfiguration = _cloneDeep(originalConfiguration)
    }

    migratedConfiguration = GridMigrations[version](migratedConfiguration)

    // A null migratedConfiguration indicates migration is not feasible. All we
    // can do is reset it to the latest default configuration
    if (!migratedConfiguration) {
      return resetGridConfigurationToDefault(originalConfiguration,
                                             generateDefaultConfiguration)
    }

    // Successful, bump the data model version
    migratedConfiguration.dataModelVersion = ++version
  }

  return migratedConfiguration || originalConfiguration
}

/**
 * Scans the given gridConfiguration for any missing/decommissioned widgets and
 * returns an array of any discovered, or an empty array if none
 */
export const decommissionedWidgets = gridConfiguration => {
  return _reduce(gridConfiguration.widgets, (missing, widgetConfiguration) => {
    const WidgetComponent = widgetComponent(widgetConfiguration)
    if (!WidgetComponent) {
      const widgetKey = _isString(widgetConfiguration) ?
                        widgetConfiguration :
                        widgetConfiguration.widgetKey
      missing.push(widgetKey)
    }
    return missing
  }, [])
}

/**
 * Returns a copy of the given gridConfiguration pruned of any missing or
 * decommissioned widgets, or the original gridConfiguration if there were none
 */
export const pruneDecommissionedWidgets = gridConfiguration => {
  const decommissioned = decommissionedWidgets(gridConfiguration)

  return decommissioned.length > 0 ?
         pruneWidgets(gridConfiguration, decommissioned) :
         gridConfiguration
}

/**
 * Returns a copy of the given gridConfiguration pruned of the given widgets,
 * or gridConfiguration if no pruning was needed
 */
export const pruneWidgets = (gridConfiguration, widgetKeys) => {
  let prunedConfiguration = gridConfiguration

  _each(widgetKeys, widgetKey => {
    const widgetIndex = _findIndex(prunedConfiguration.widgets, {widgetKey})
    if (widgetIndex !== -1) {
      // If we haven't made a fresh copy of gridConfiguration yet, do so now
      if (prunedConfiguration === gridConfiguration) {
        prunedConfiguration = _cloneDeep(gridConfiguration)
      }

      prunedConfiguration.widgets.splice(widgetIndex, 1)
      prunedConfiguration.layout.splice(widgetIndex, 1)
    }
  })

  return prunedConfiguration
}

/**
 * Return a gridConfiguration with the given widgetDescriptor added to it,
 * using the optional defaultConfiguration as a reference for the widget's
 * position
 */
export const addWidgetToGrid = (gridConfiguration, widgetKey, defaultConfiguration) => {
  const descriptor = widgetDescriptor(widgetKey)
  if (!descriptor) {
    throw new Error(`Attempt to add unknown widget ${widgetKey} to workspace.`)
  }

  const updatedConfiguration = _cloneDeep(gridConfiguration)
  updatedConfiguration.widgets.unshift(descriptor)

  // For simplicity, we'll add the new widget to the top row (the grid should
  // auto-adjust). If the widget is laid out in the default configuration,
  // we'll also match its default column
  let defaultColumn = 0
  if (defaultConfiguration) {
    const widgetIndex = _findIndex(defaultConfiguration.widgets, {widgetKey})

    if (widgetIndex !== -1) {
      defaultColumn = defaultConfiguration.layout[widgetIndex].x
    }
  }

  updatedConfiguration.layout.unshift({
    i: generateWidgetId(),
    x: defaultColumn,
    y: 0,
    w: descriptor.defaultWidth,
    minW: descriptor.minWidth,
    maxW: descriptor.maxWidth,
    h: descriptor.defaultHeight,
    minH: descriptor.minHeight,
    maxH: descriptor.maxHeight,
  })

  return updatedConfiguration
}

/**
 * Returns a gridConfiguration that has all permanent widgets in the given
 * defaultConfiguration added to it (either a new instance if widgets needed to
 * be added, or the given gridConfiguration if no additions were necessary)
 */
export const ensurePermanentWidgetsAdded = (gridConfiguration, defaultConfiguration) => {
  let updatedConfiguration = gridConfiguration

  _each(gridConfiguration.permanentWidgets, widgetKey => {
    if (!_find(updatedConfiguration.widgets, {widgetKey})) {
      updatedConfiguration = addWidgetToGrid(updatedConfiguration,
                                             widgetKey,
                                             defaultConfiguration)
    }
  })

  return updatedConfiguration
}

/**
 * Downloads a JSON representation of the given workspace configuration
 * suitable for import by this or another user into the same workspace
 */
export const exportWorkspaceConfiguration = (workspaceConfiguration, exportName) => {
  const exportRepresentation = {
    meta: {
      exportFormatVersion: 1,
      targetWorkspace: workspaceConfiguration.name,
      exportName: exportName ? exportName : workspaceConfiguration.label,
      exportTimestamp: (new Date()).toISOString(),
    },
    workspace: Object.assign(
      _pick(workspaceConfiguration, ['dataModelVersion', 'name', 'cols', 'rowHeight', 'targets']),
      {
        widgetKeys: _map(workspaceConfiguration.widgets, 'widgetKey'),
        layout: _map(workspaceConfiguration.layout,
                    widgetLayout => _pick(widgetLayout, ['h', 'w', 'x', 'y'])),
      }
    ),
  }

  const exportBlob = new Blob([JSON.stringify(exportRepresentation)],
                              {type: "application/json;charset=utf-8"})
  FileSaver.saveAs(
    exportBlob,
    `${_snakeCase(workspaceConfiguration.name)}-${_snakeCase(exportRepresentation.meta.exportName)}-layout.json`
  )
}

/**
 * Parses and returns a previously-exported workspace layout from the given
 * file
 */
export const importWorkspaceConfiguration = (workspaceName, importFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      let representation = null
      try {
        representation = JSON.parse(reader.result)
      }
      catch(error) {
        reject(new Error("unrecognized or unsupported import format"))
        return
      }

      try {
        if (!representation || !representation.meta || representation.meta.exportFormatVersion !== 1) {
          reject(new Error("unrecognized or unsupported import format"))
          return
        }

        // Todo: validate import against a json schema rather than these piecemeal checks
        if (representation.meta.targetWorkspace !== workspaceName) {
          reject(new Error("imported layout is not intended for this workspace"))
          return
        }

        if (!representation.workspace) {
          reject(new Error("imported layout appears to be corrupted"))
          return
        }

        const importedConfiguration = representation.workspace
        importedConfiguration.label = representation.meta.exportName
        importedConfiguration.widgets =
          _map(importedConfiguration.widgetKeys, key => widgetDescriptor(key))
        delete importedConfiguration.widgetKeys

        _each(importedConfiguration.layout, widgetLayout => widgetLayout.i = generateWidgetId())
        resolve(importedConfiguration)
      }
      catch(error) {
        reject(error)
      }
    }
    reader.readAsText(importFile)
  })
}

/**
 * Determines the next available (non-duplicated) version of the given
 * preferredName, returning preferredName if it does not duplicate any of the
 * existing configuration names, or else an altered unique version in the form
 * of `preferredName (x)`
 */
export const nextAvailableConfigurationLabel = function(preferredLabel, existingLabels, dupValue=1) {
  if (dupValue <= 1 && existingLabels.indexOf(preferredLabel) === -1) {
    return preferredLabel
  }

  const candidateName = `${preferredLabel} (${dupValue})`
  if (existingLabels.indexOf(candidateName) === -1) {
    return candidateName
  }

  return nextAvailableConfigurationLabel(preferredLabel, existingLabels, dupValue + 1)
}
