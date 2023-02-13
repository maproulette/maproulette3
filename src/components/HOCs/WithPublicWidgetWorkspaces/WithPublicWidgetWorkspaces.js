import React, { Component } from 'react'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
import _each from 'lodash/each'
import _assign from 'lodash/assign'
import {
  generateWidgetId,
  widgetDescriptor,
} from '../../../services/Widget/Widget'

/**
 * WithWidgetWorkspaces provides the WrappedComponent with access to the saved
 * workspace configurations as well as various workspace-configuration
 * management functions.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithWidgetWorkspacesInternal = function (
  WrappedComponent,
  targets,
  workspaceName,
  defaultConfiguration
) {
  return class extends Component {
    /**
     * Sets up a brand-new workspace based on the given default configuration
     * function
     */
    setupWorkspace = (defaultConfiguration) => {
      const conf = defaultConfiguration()
      // Ensure default layout honors properties from each widget's descriptor
      for (let i = 0; i < conf.widgets.length; i++) {
        const widget = conf.widgets[i]
        if (widget) {
          conf.layout[i] = Object.assign(
            {},
            {
              minW: widget.minWidth,
              maxW: widget.maxWidth,
              minH: widget.minHeight,
              maxH: widget.maxHeight,
            },
            conf.layout[i]
          )
        }
      }

      return conf
    }

    /**
     * Completes a given workspace configuration, filling in missing fields
     * with reasonable default values
     *
     * @private
     */
    completeWorkspaceConfiguration = (initialWorkspace) => {
      let configuration = _assign(
        {
          id: generateWidgetId(),
          targets: _isArray(targets) ? targets : [targets], // store as array
          cols: 12,
          rowHeight: 30,
          widgets: [],
          layout: [],
        },
        initialWorkspace
      )

      // Generate a simple layout if none provided, with one widget per row
      if (configuration.layout.length === 0) {
        let nextY = 0
        _each(configuration.widgets, (widgetConf) => {
          configuration.layout.push({
            i: generateWidgetId(),
            x: 0,
            y: nextY,
            w: widgetConf.defaultWidth,
            minW: widgetConf.minWidth,
            maxW: widgetConf.maxWidth,
            h: widgetConf.defaultHeight,
            minH: widgetConf.minHeight,
            maxH: widgetConf.maxHeight,
          })

          nextY += widgetConf.defaultHeight
        })
      } else {
        // A layout was provided. If heights and/or widths were omitted or don't meet
        // current minimums, fill them in from the widget descriptors
        _each(configuration.layout, (widgetLayout, index) => {
          if (!configuration.widgets || !configuration.widgets[index]) {
            return
          }

          const descriptor = widgetDescriptor(
            configuration.widgets[index].widgetKey
          )
          if (!descriptor) {
            return
          }

          if (!_isFinite(widgetLayout.w)) {
            widgetLayout.w = descriptor.defaultWidth
          } else if (
            _isFinite(descriptor.minWidth) &&
            widgetLayout.w < descriptor.minWidth
          ) {
            widgetLayout.w = descriptor.minWidth
          }

          if (!_isFinite(widgetLayout.h)) {
            widgetLayout.h = descriptor.defaultHeight
          } else if (
            _isFinite(descriptor.minHeight) &&
            widgetLayout.h < descriptor.minHeight
          ) {
            widgetLayout.h = descriptor.minHeight
          }
        })
      }

      return configuration
    }

    /**
     * Retrieve the current, active configuration or a default configuration if
     * there is no active configuration
     */
    currentConfiguration = () => {
      return this.completeWorkspaceConfiguration(
        this.setupWorkspace(defaultConfiguration)
      )
    }

    render() {
      const currentConfiguration = this.currentConfiguration()
      return (
        <WrappedComponent
          {...this.props}
          name={workspaceName}
          targets={targets}
          defaultConfiguration={defaultConfiguration}
          currentConfiguration={currentConfiguration}
        />
      )
    }
  }
}

const WithPublicWidgetWorkspaces = (
  WrappedComponent,
  targets,
  workspaceName,
  defaultConfiguration
) =>
  WithWidgetWorkspacesInternal(
    WrappedComponent,
    targets,
    workspaceName,
    defaultConfiguration
  )

export default WithPublicWidgetWorkspaces
