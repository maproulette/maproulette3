import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import L from 'leaflet'
import 'leaflet-lasso'
import { injectIntl } from 'react-intl'
import { createControlComponent } from '@react-leaflet/core'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'

/**
 * Leaflet control that intializes leaflet-lasso for lasso selection of map
 * markers
 *
 * Note: An object passed to the constructor will be available as `this.options`
 *
 * @private
 */
const LassoSelectionLeafletControl = L.Control.extend({
  onAdd: function(map) {
    const lasso = L.lasso(map, {})
    let deselecting = false

    map.on('lasso.finished', (event) => {
      deselecting ?
      this.options.onLassoDeselection(event.layers) :
      this.options.onLassoSelection(event.layers)
    })

    // build the control button, render it, and return it
    const controlContent = (
      <React.Fragment>
        {this.options.onLassoSelection &&
          <button
            onClick={() => {
              deselecting = false
              lasso.toggle()
              this.options.onLassoInteraction && this.options.onLassoInteraction()
            }}
            className={classNames(
              "mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-transition-normal-in-out-quad hover:mr-text-green-lighter",
              this.options.onLassoDeselection ? "mr-rounded-t-sm mr-border-b mr-border-white-15" : "mr-rounded-sm"
            )}
          >
            <SvgSymbol
              sym={this.options.onLassoDeselection ? "lasso-add-icon" : "lasso-icon"}
              className="mr-w-4 mr-h-4 mr-fill-current mr-stroke-current"
              viewBox="0 0 512 512"
            />
          </button>
        }
        {this.options.onLassoDeselection &&
        <button
          onClick={() => {
            deselecting = true
            lasso.toggle()
            this.options.onLassoInteraction && this.options.onLassoInteraction()
          }}
          className={classNames(
            "mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-transition-normal-in-out-quad hover:mr-text-green-lighter",
            this.options.onLassoClear ? "mr-border-b mr-border-white-15" : "mr-rounded-b-sm mr-shadow"
          )}
        >
          <SvgSymbol
            sym="lasso-remove-icon"
            className="mr-w-4 mr-h-4 mr-fill-current mr-stroke-current"
            viewBox="0 0 512 512"
          />
        </button>
        }
        {this.options.onLassoClear &&
         <button
           onClick={() => {
             this.options.onLassoClear()
             this.options.onLassoInteraction && this.options.onLassoInteraction()
           }}
           className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-b-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
         >
           <SvgSymbol
             sym="cross-icon"
             className="mr-w-4 mr-h-4 mr-fill-current mr-stroke-current"
             viewBox="0 0 20 20"
           />
         </button>
        }
      </React.Fragment>
    )

    const controlContainer = L.DomUtil.create('div')
    ReactDOM.render(controlContent, controlContainer)
    return controlContainer
  },
})

/**
 * LassoSelectionControl is a react-leaflet MapControl component intended to be
 * used as a child of a react-leaflet Map instance, such as EnhancedMap. When
 * clicked, the control toggles activation of a lasso tool for selecting map
 * features
 */
export const LassoSelectionControl = createControlComponent(
  (props) => {return new LassoSelectionLeafletControl(props)}
)

export default injectIntl(LassoSelectionControl)