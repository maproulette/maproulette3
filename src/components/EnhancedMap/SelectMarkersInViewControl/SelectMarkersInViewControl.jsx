import ReactDOM from 'react-dom'
import L from 'leaflet'
import { injectIntl } from 'react-intl'
import { createControlComponent } from '@react-leaflet/core'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import messages from './Messages'

/**
 * Leaflet control that selects all task markers currently in view on the map
 *
 * Note: An object passed to the constructor will be available as `this.options`
 *
 * @private
 */
const SelectMarkersInViewLeafletControl = L.Control.extend({

  onAdd: function(map) {
    const handleSelectAllInViewClick = () => {
      if(!map || !map._layers) return
      const taskIds = _compact(_map(map._layers, layer => _get(layer, 'options.icon.options.taskData.taskId')))
      // Disallow use if cannot populate taskIds from map
      if(!taskIds.length) return
      this.options.onSelectAllInView(taskIds)
    }
   
    const controlContent = (
      <button
        className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
        onClick={handleSelectAllInViewClick}
      >

        <SvgSymbol
          title={this.options.intl.formatMessage(messages.tooltip)}
          sym="check-circled-icon"
          className="mr-w-4 mr-h-4 mr-fill-current mr-stroke-current"
          viewBox="0 0 20 20" 
        />
      </button>

    )

    const controlContainer = L.DomUtil.create('div')
    ReactDOM.render(controlContent, controlContainer)
    return controlContainer
  },
})

/**
 * SelectMarkersInViewControl is a react-leaflet Control component intended to be
 * used as a child of a react-leaflet MapContainer instance, when clicked
 * the control selects all task markers currently visible on the map.
 */
export const SelectMarkersInViewControl = createControlComponent((props) => new SelectMarkersInViewLeafletControl(props))

export default injectIntl(SelectMarkersInViewControl)











     
 

