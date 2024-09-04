import _get from 'lodash/get'
import _compact from 'lodash/compact'
import _map from 'lodash/map'
import _toPairs from 'lodash/toPairs'
import _each from 'lodash/each'
import _isEmpty from 'lodash/isEmpty'
import _values from 'lodash/values'
import _isUndefined from 'lodash/isUndefined'
import { CooperativeType }
       from '../../services/Challenge/CooperativeType/CooperativeType'

/**
 * AsCooperativeWork adds functionality to a Task related to working
 * cooperatively with OSM changes proposed by the challenge creator
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AsCooperativeWork {
  constructor(task) {
    Object.assign(this, task)
  }

  /**
   * Determines if this represents a cooperative task
   */
  isCooperative() {
    return !_isUndefined(this.cooperativeWork)
  }

  /**
   * Retrieve the format version of the cooperative work
   */
  cooperativeWorkVersion() {
    return _get(this.cooperativeWork, 'meta.version')
  }

  /*
   * Returns true if this is v1-formatted cooperative work
   */
  isVersion1() {
    return this.cooperativeWorkVersion() === 1
  }

  /*
   * Returns true if this is v2-formatted cooperative work
   */
  isVersion2() {
    return this.cooperativeWorkVersion() === 2
  }

  /**
   * Retrieves the type of cooperative work
   */
  workType() {
    // Version 1 didn't have a type and only supported tag fixes
    if (this.isVersion1()) {
      return CooperativeType.tags
    }

    return _get(this.cooperativeWork, 'meta.type')
  }

  /**
   * Returns true if this is a tag fix type
   */
  isTagType() {
    return this.workType() === CooperativeType.tags
  }

  /**
   * Returns true if this includes a change file
   */
  isChangeFileType() {
    return this.workType() === CooperativeType.changeFile
  }

  /**
   * Returns true if the task is a tag fix type with at least one operation
   */
  hasTagOperations() {
    return this.isTagType() &&
           _get(this.cooperativeWork, 'operations.length', 0) > 0
  }

  /**
   * Returns an array of (existing) referenced OSM elements as objects in the
   * form of {elementType, elementId}
   */
  existingOSMElementIds() {
    if (!this.hasTagOperations()) {
      return []
    }

    return _compact(_map(this.cooperativeWork.operations, operation => {
      switch(operation.operationType) {
        case 'createElement':
          return null
        case 'modifyElement':
        case 'deleteElement':
          return _get(operation, 'data.id')
        default:
          throw new Error(`unrecognized operation type: ${operation.operationType}`)
      }
    }))
  }

  tagDiffs(osmElements) {
    if (!this.hasTagOperations()) {
      return []
    }

    return _compact(_map(this.cooperativeWork.operations, independentOperation => {
      if (independentOperation.operationType !== 'modifyElement') {
        return null
      }

      if (!osmElements.has(independentOperation.data.id)) {
        throw new Error(`Unable to generate tag diff: OSM data not available for ${independentOperation.data.id}`)
      }

      const diff = {}
      _each(osmElements.get(independentOperation.data.id).tag, tag => {
        diff[tag.k] = {
          name: tag.k,
          value: tag.v,
          newValue: tag.v,
          status: 'unchanged',
        }
      })

      _each(independentOperation.data.operations, dependentOperation => {
        switch(dependentOperation.operation) {
          case 'setTags':
            _each(_toPairs(dependentOperation.data), tagComponents => {
              const diffEntry = diff[tagComponents[0]]
              if (!diffEntry) {
                // New tag
                diff[tagComponents[0]] = {
                  name: tagComponents[0],
                  value: null,
                  newValue: tagComponents[1],
                  status: 'added',
                }
              }
              else if (diffEntry.value !== tagComponents[1]) {
                // Modified tag
                diffEntry.newValue = tagComponents[1]
                diffEntry.status = 'changed'
              }
              else {
                diffEntry.newValue = tagComponents[1]
                diffEntry.status = 'resolved'
              }
            })
            break
          case 'unsetTags':
            _each(dependentOperation.data, tagName => {
              const diffEntry = diff[tagName]
              if (diffEntry) {
                // Delete tag
                diffEntry.newValue = null
                diffEntry.status = 'removed'
              }
              else {
                diffEntry.newValue = null
                diffEntry.status = 'resolved'
              }
            })
            break
          default:
            break
        }
      })

      return diff
    }))
  }

  /**
   * Summarizes tag changes for each OSM element in the form of
   * { osmId, osmType, updates, deletes }, taking into account the given tag
   * edits (if any)
   */
  tagChangeSummary(tagEdits=null) {
    if (!this.hasTagOperations()) {
      return []
    }

    return _compact(_map(this.cooperativeWork.operations, independentOperation => {
      if (independentOperation.operationType !== 'modifyElement') {
        return null
      }

      const idTokens = independentOperation.data.id.split('/')
      const change = {
        osmType: idTokens[0].toUpperCase(),
        osmId: parseInt(idTokens[1]),
        updates: {},
        deletes: [],
      }

      if (tagEdits) {
        // Work from tag edits instead of dependent operations
        _each(_values(tagEdits), edit => {
          if (edit.status === 'added' || edit.status === 'changed') {
            change.updates[edit.name] = edit.newValue
          }
          else if (edit.status === 'removed') {
            change.deletes.push(edit.name)
          }
        })
      }
      else {
        _each(independentOperation.data.operations, dependentOperation => {
          if (dependentOperation.operation === 'setTags') {
            change.updates = Object.assign(change.updates, dependentOperation.data)
          }
          else if (dependentOperation.operation === 'unsetTags') {
            change.deletes = change.deletes.concat(dependentOperation.data)
          }
        })
      }

      if (_isEmpty(change.updates) && _isEmpty(change.deletes)) {
        return null
      }

      return change
    }))
  }
}

export default task => new AsCooperativeWork(task)
