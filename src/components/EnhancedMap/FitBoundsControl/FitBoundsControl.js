import React from 'react'
import ReactDOM from 'react-dom'
import { Control, Handler, DomUtil, DomEvent, FeatureGroup }
       from 'leaflet'
import { injectIntl } from 'react-intl'
import { createControlComponent } from '@react-leaflet/core'
import _pick from 'lodash/pick'
import _isEmpty from 'lodash/isEmpty'
import WithKeyboardShortcuts
       from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './FitBoundsControl.scss'

const shortcutGroup = 'taskEditing'

/**
 * Leaflet control for that fits the map bounds to the current features added
 * to the leaflet Map. This is wrapped by the FitBoundsControl below, which is
 * a react-leaflet MapControl.
 *
 * Note: An object passed to the constructor will be available as `this.options`
 *
 * @private
 */
const FitBoundsLeafletControl = Control.extend({
  fitFeatures: function(map, event) {
    // Ignore if shortcut group is not active
    if (_isEmpty(this.options.activeKeyboardShortcuts[shortcutGroup])) {
      return
    }

    if (this.options.textInputActive(event)) { // ignore typing in inputs
      return
    }

    const geoJSONFeatures = new FeatureGroup()

    // If we are given a centerPoint let's move the map to it.
    if (this.options.centerPoint) {
      map.setView(this.options.centerPoint)
      return
    }

    if (this.options.centerBounds) {
      map.fitBounds(this.options.centerBounds.pad(0.2))
      return
    }

    map.eachLayer(layer => {
      if (layer.feature) {
        geoJSONFeatures.addLayer(layer)
      }
    })

    if (geoJSONFeatures.getLayers().length !== 0) {
      map.fitBounds(geoJSONFeatures.getBounds().pad(0.2))
    }
  },

  onAdd: function(map) {
    // Add keyboard shortcut handler to the map
    map.addHandler(
      'fitBoundsKeyboardHandler',
      keyboardHandler(this.options.keyboardShortcutGroups.taskEditing.fitBounds.key,
                      event => this.fitFeatures(map, event))
    )

    // Register the handler so the shortcut will show up on a list of active
    // shortcuts. It's an "external" shortcut because the event is handled
    // externally (here) instead of by WithKeyboardShortcuts
    this.options.addExternalKeyboardShortcut(
      shortcutGroup,
      _pick(this.options.keyboardShortcutGroups.taskEditing, 'fitBounds')
    )

    // enable the keyboard handler
    map.fitBoundsKeyboardHandler.enable()

    // build the control button, render it, and return it
    const controlContent = (
      <button
        onClick={event => this.fitFeatures(map, event)}
        className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
      >
        <SvgSymbol
          title={this.options.intl.formatMessage(messages.tooltip)}
          sym="target-icon"
          className="mr-w-4 mr-h-4 mr-fill-current"
          viewBox="0 0 20 20"
        />
      </button>
    )

    const controlContainer = DomUtil.create('div')
    ReactDOM.render(controlContent, controlContainer)
    return controlContainer
  },

  onRemove: function(map) {
    // Remove and unregister the keyboard shortcut handler
    if (map.fitBoundsKeyboardHandler) {
      map.fitBoundsKeyboardHandler.disable()

      this.options.removeExternalKeyboardShortcut(
        shortcutGroup,
        _pick(this.options.keyboardShortcutGroups.taskEditing, 'fitBounds')
      )
    }
  },
})

/**
 * Keyboard shortcut handler for fitting bounds
 */
const keyboardHandler = function(key, controlFunction) {
  return Handler.extend({
    addHooks: function() {
      DomEvent.on(document, 'keydown', this.onKeydown, this)
    },

    removeHooks: function() {
      DomEvent.off(document, 'keydown', this.onKeydown, this)
    },

    onKeydown: function(event) {
      if (event.key === key) {
        controlFunction(event)
      }
    }
  })
}

/**
 * FitBoundsControl is a react-leaflet Control component intended to be used
 * as a child of a react-leaflet Map instance.
 */
export const FitBoundsControl = createControlComponent((props) => new FitBoundsLeafletControl(props))

export default WithKeyboardShortcuts(injectIntl(FitBoundsControl))
