import React, { Component } from 'react';
import _clone from 'lodash/clone'
import _cloneDeep from 'lodash/cloneDeep'
import _each from 'lodash/each'
import _differenceBy from 'lodash/differenceBy'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import { generateWidgetId, widgetDescriptor, compatibleWidgetTypes }
       from '../../../services/Widget/Widget'

/**
 * WithWidgetManagement provides the wrapped component with functions for
 * adding, removing, updating, and rearranging widgets on a grid. It expects to
 * be given a WidgetWorkspace serving as the canonical source of the layout and
 * configuration of the grid widgets, which this HOC will keep up to date with
 * any changes to the grid.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithWidgetManagement = function(WrappedComponent) {
  return class extends Component {
    /**
     * Retrieve array of compatible widgets not yet added to the workspace
     */
    availableWidgets = () => {
      const compatibleWidgets = compatibleWidgetTypes(this.props.workspace.targets)
      return _differenceBy(compatibleWidgets, this.props.workspace.widgets, 'widgetKey')
    }

    /**
     * Add the widget with the given widget key to the current workspace
     */
    addWidget = widgetKey => {
      // Make sure the widget is not already added to the workspace
      if (_findIndex(this.props.workspace.widgets, {widgetKey}) !== -1) {
        return
      }

      const descriptor = widgetDescriptor(widgetKey)
      if (!descriptor) {
        throw new Error(`Attempt to add unknown widget ${widgetKey} to workspace.`)
      }

      // For simplicity, we'll add the new widget to the top in its own row.
      const updatedWidgets = _clone(this.props.workspace.widgets)
      updatedWidgets.unshift(descriptor)

      const updatedLayout = _cloneDeep(this.props.workspace.layout)
      // Push everything down to make room for the new widget
      _each(updatedLayout, row => row.y += (descriptor.defaultHeight))

      updatedLayout.unshift({
        i: generateWidgetId(),
        x: 0,
        y: 0,
        w: descriptor.defaultWidth,
        minW: descriptor.minWidth,
        maxW: descriptor.maxWidth,
        h: descriptor.defaultHeight,
        minH: descriptor.minHeight,
        maxH: descriptor.maxHeight,
      })

      this.props.saveWorkspaceConfiguration(
        Object.assign(
          {},
          this.props.workspace,
          {widgets: updatedWidgets, layout: updatedLayout}
        ))
    }

    /**
     * Remove the widget at the given index from the current workspace
     */
    removeWidget = widgetIndex => {
      const updatedWidgets = _clone(this.props.workspace.widgets)
      updatedWidgets.splice(widgetIndex, 1)

      const updatedLayout = _clone(this.props.workspace.layout)
      updatedLayout.splice(widgetIndex, 1)

      // The grid should automatically recompact itself vertically, so we don't
      // need to make any further adjustments to the layout.
      this.props.saveWorkspaceConfiguration(
        Object.assign(
          {},
          this.props.workspace,
          {widgets: updatedWidgets, layout: updatedLayout}
        ))
    }

    /**
     * Resize the height of the widget with the given id. This allows widgets
     * to resize themselves programatically (e.g. to support minimization). If
     * a user resizes the widget via dragging, that will come through a call to
     * `updateLayout` and not this method.
     *
     * > Note: react-grid-layout performs automatic vertical compaction of
     * > widgets, so resizing the height of a widget is much easier than
     * > resizing the width, and requires no further layout work from us.
     */
    updateWidgetHeight = (widgetId, newHeight) => {
      const updatedWorkspaceLayout = _cloneDeep(this.props.workspace.layout)
      const widgetLayout = _find(updatedWorkspaceLayout, {i: widgetId})
      if (!widgetLayout) {
        return
      }

      widgetLayout.h = newHeight
      this.props.saveWorkspaceConfiguration(
        Object.assign({}, this.props.workspace, {layout: updatedWorkspaceLayout})
      )
    }

    /**
     * Update the internal configuration of the widget at the given index with
     * the given changes. These changes will be merged into any existing
     * configuration.
     */
    updateWidgetConfiguration = (widgetIndex, changes) => {
      const updatedWidgets = _clone(this.props.workspace.widgets)
      updatedWidgets[widgetIndex] = Object.assign({}, updatedWidgets[widgetIndex], {
        defaultConfiguration: Object.assign({},
                                            updatedWidgets[widgetIndex].defaultConfiguration,
                                            changes)
      })

      this.props.saveWorkspaceConfiguration(
        Object.assign(
          {},
          this.props.workspace,
          {widgets: updatedWidgets}
        ))
    }

    /**
     * Invoked by the wrapped grid when the workspace layout needs to be
     * updated, i.e.  because the user resized or reordered widgets on the grid
     */
    updateLayout = newLayout => {
      this.props.saveWorkspaceConfiguration(
        Object.assign(
          {},
          this.props.workspace,
          {layout: newLayout}
        ))
    }

    render() {
      return (
        <WrappedComponent {...this.props}
                          addWidget={this.addWidget}
                          removeWidget={this.removeWidget}
                          updateWidgetHeight={this.updateWidgetHeight}
                          availableWidgets={this.availableWidgets}
                          updateWidgetConfiguration={this.updateWidgetConfiguration}
                          onLayoutChange={this.updateLayout} />
      )
    }
  }
}

export default WithWidgetManagement
