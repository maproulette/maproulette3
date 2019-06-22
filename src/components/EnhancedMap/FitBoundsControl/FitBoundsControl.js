import React from 'react'
import ReactDOM from 'react-dom'
import { Control, Handler, DomUtil, DomEvent, FeatureGroup }
       from 'leaflet'
import { injectIntl } from 'react-intl'
import { MapControl, withLeaflet } from 'react-leaflet'
import _pick from 'lodash/pick'
import WithKeyboardShortcuts
       from '../../HOCs/WithKeyboardShortcuts/WithKeyboardShortcuts'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './FitBoundsControl.scss'

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
  fitFeatures: function(map) {
    const geoJSONFeatures = new FeatureGroup()

    map.eachLayer(layer => {
      if (layer.feature) {
        geoJSONFeatures.addLayer(layer)
      }
    })

    if (geoJSONFeatures.getLayers().length !== 0) {
      map.fitBounds(geoJSONFeatures.getBounds().pad(0.5))
    }
  },

  onAdd: function(map) {
    // Add keyboard shortcut handler to the map
    map.addHandler(
      'fitBoundsKeyboardHandler',
      keyboardHandler(this.options.keyboardShortcutGroups.taskEditing.fitBounds.key,
                      () => this.fitFeatures(map))
    )

    // Register the handler so the shortcut will show up on a list of active
    // shortcuts. It's an "external" shortcut because the event is handled
    // externally (here) instead of by WithKeyboardShortcuts
    this.options.addExternalKeyboardShortcut(
      'taskEditing',
      _pick(this.options.keyboardShortcutGroups.taskEditing, 'fitBounds')
    )

    // enable the keyboard handler
    map.fitBoundsKeyboardHandler.enable()

    // build the control button, render it, and return it
    const controlContent = (
      <button onClick={() => this.fitFeatures(map)} className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter">
        <SvgSymbol title={this.options.intl.formatMessage(messages.tooltip)} sym="target-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
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
        'taskEditing',
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
        controlFunction()
      }
    }
  })
}

/**
 * FitBoundsControl is a react-leaflet MapControl component intended to be used
 * as a child of a react-leaflet Map instance, such as EnhancedMap. When clicked,
 * the control fits the map to the bounds of the current features.
 */
export class FitBoundsControl extends MapControl {
  // props will be available as `options` field in the leaflet control
  createLeafletElement(props) {
    return new FitBoundsLeafletControl(props)
  }
}

export default WithKeyboardShortcuts(withLeaflet(injectIntl(FitBoundsControl)))
