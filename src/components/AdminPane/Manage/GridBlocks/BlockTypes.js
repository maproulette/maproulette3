import _isObject from 'lodash/isObject'
import _map from 'lodash/map'
import _compact from 'lodash/compact'
import _intersection from 'lodash/intersection'

/**
 * Registered dashboard block types with descriptors.
 *
 * @private
 */
const BlockTypes = {}

/**
 * Register a new block type with the given component (which should be pre-wrapped with
 * any needed higher-order components) and block descriptor.
 */
export const registerBlockType = function(blockComponent, blockDescriptor) {
  if (!blockDescriptor) {
    throw new Error("Cannot register block type without descriptor")
  }

  if (!blockDescriptor.blockKey) {
    throw new Error("Cannot register block type without descriptor.blockKey")
  }

  BlockTypes[blockDescriptor.blockKey] = {
    descriptor: blockDescriptor,
    component: blockComponent
  }
}

/**
 * Retrieves the descriptor for the block identified by the given key, or null
 * if no block is found.
 */
export const blockDescriptor = function(blockKey) {
  return BlockTypes[blockKey] ? BlockTypes[blockKey].descriptor : null
}

/**
 * Looks up a block component from either the given blockKey (string) or block
 * descriptor (object) containing a blockKey. Returns null if no matching
 * component is found.
 */
export const blockComponent = function(keyOrDescriptor) {
  const blockKey =
    _isObject(keyOrDescriptor) ? keyOrDescriptor.blockKey : keyOrDescriptor

  return BlockTypes[blockKey] ? BlockTypes[blockKey].component : null
}

/**
 * Returns an array of descriptors for block types that have data targets compatible
 * with the given dataTargets.
 */
export const compatibleBlockTypes = function(dataTargets) {
  return _compact(_map(BlockTypes, blockInfo => (
    _intersection(dataTargets, blockInfo.descriptor.targets).length === 0 ?
    null :
    blockInfo.descriptor
  )))
}
