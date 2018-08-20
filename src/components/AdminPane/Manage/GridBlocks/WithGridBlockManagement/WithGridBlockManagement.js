import React, { Component } from 'react';
import _clone from 'lodash/clone'
import _cloneDeep from 'lodash/cloneDeep'
import _each from 'lodash/each'
import _differenceBy from 'lodash/differenceBy'
import _findIndex from 'lodash/findIndex'
import { blockDescriptor, compatibleBlockTypes } from '../BlockTypes'
import { generateDashboardId } from '../../../../../services/Dashboard/Dashboard'

/**
 * WithGridBlockManagement provides the wrapped component with functions for
 * adding, removing, updating, and rearranging grid blocks
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithGridBlockManagement = function(WrappedComponent) {
  return class extends Component {
    /** Retrieve array of compatible blocks not yet added to the dashboard */
    availableBlocks = () => {
      const compatibleBlocks = compatibleBlockTypes(this.props.dashboard.targets)
      return _differenceBy(compatibleBlocks, this.props.dashboard.blocks, 'blockKey')
    }

    /** Add the block with the given block key to the current dashboard */
    addBlock = blockKey => {
      // Make sure the block is not already added to the dashboard
      if (_findIndex(this.props.dashboard.blocks, {blockKey}) !== -1) {
        return
      }

      const descriptor = blockDescriptor(blockKey)
      if (!descriptor) {
        throw new Error(`Attempt to add unknown block ${blockKey} to dashboard.`)
      }

      // For simplicity, we'll add the new block to the top in its own row.
      const updatedBlocks = _clone(this.props.dashboard.blocks)
      updatedBlocks.unshift(descriptor)

      const updatedLayout = _cloneDeep(this.props.dashboard.layout)
      // Push everything down to make room for the new block.
      _each(updatedLayout, row => row.y += (descriptor.defaultHeight))

      updatedLayout.unshift({
        i: generateDashboardId(),
        x: 0,
        y: 0,
        w: descriptor.defaultWidth,
        minW: descriptor.minWidth,
        maxW: descriptor.maxWidth,
        h: descriptor.defaultHeight,
        minH: descriptor.minHeight,
        maxH: descriptor.maxHeight,
      })

      this.props.saveDashboardConfiguration(
        Object.assign({}, this.props.dashboard, {blocks: updatedBlocks, layout: updatedLayout}))
    }

    /** Remove the block at the given index from the current dashboard */
    removeBlock = blockIndex => {
      const updatedBlocks = _clone(this.props.dashboard.blocks)
      updatedBlocks.splice(blockIndex, 1)

      const updatedLayout = _clone(this.props.dashboard.layout)
      updatedLayout.splice(blockIndex, 1)

      // The grid should automatically recompact itself vertically, so we don't
      // need to make any further adjustments to the layout.
      this.props.saveDashboardConfiguration(
        Object.assign({}, this.props.dashboard, {blocks: updatedBlocks, layout: updatedLayout}))
    }

    /**
     * Update the internal configuration of the block at the given index with
     * the given changes. These changes will be merged into any existing
     * configuration.
     */
    updateBlockConfiguration = (blockIndex, changes) => {
      const updatedBlocks = _clone(this.props.dashboard.blocks)
      updatedBlocks[blockIndex] = Object.assign({}, updatedBlocks[blockIndex], {
        defaultConfiguration: Object.assign({},
                                            updatedBlocks[blockIndex].defaultConfiguration,
                                            changes)
      })

      this.props.saveDashboardConfiguration(
        Object.assign({}, this.props.dashboard, {blocks: updatedBlocks}))
    }

    /**
     * Updates the dashboard layout, i.e. when the user resizes or reorders
     * blocks on a dashboard.
     */
    updateLayout = newLayout => {
      this.props.saveDashboardConfiguration(
        Object.assign({}, this.props.dashboard, {layout: newLayout}))
    }

    render() {
      return (
        <WrappedComponent {...this.props}
                          addBlock={this.addBlock}
                          removeBlock={this.removeBlock}
                          availableBlocks={this.availableBlocks}
                          updateBlockConfiguration={this.updateBlockConfiguration}
                          onLayoutChange={this.updateLayout} />
      )
    }
  }
}

export default WithGridBlockManagement
