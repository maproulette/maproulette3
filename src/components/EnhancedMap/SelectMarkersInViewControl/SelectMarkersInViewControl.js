import React from 'react'
import ReactDOM from 'react-dom'
import L from 'leaflet'
import { injectIntl } from 'react-intl'
import { MapControl, withLeaflet } from 'react-leaflet'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import _map from 'lodash/map'
import _get from 'lodash/get'
import _compact from 'lodash/compact'
import messages from './Messages'


const SelectMarkersInViewLeafletControl = L.Control.extend({

  onAdd: function(map) {
    const handleSelectAllInViewClick = () => {

      const taskIds = _compact(_map(map._layers, layer => _get(layer, 'options.icon.options.taskData.taskId')))
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

export class SelectMarkersInViewControl extends MapControl {
  createLeafletElement(props) {
    return new SelectMarkersInViewLeafletControl(props)
  }
}

export default withLeaflet(injectIntl(SelectMarkersInViewControl))











     
 

