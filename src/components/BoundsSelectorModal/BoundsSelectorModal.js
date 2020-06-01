import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import bbox from '@turf/bbox'
import _split from 'lodash/split'
import classNames from 'classnames'
import { Map, ZoomControl } from 'react-leaflet'
import { toLatLngBounds, fromLatLngBounds }
       from '../../services/MapBounds/MapBounds'
import SourcedTileLayer
       from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import Modal from '../Modal/Modal'
import External from '../External/External'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import AreaSelect from '../AreaSelect/AreaSelect'
import { defaultLayerSource }
       from '../../services/VisibleLayer/LayerSources'
import messages from './Messages'

/**
 * BoundsSelectorModal presents a modal that displays a
 * map on which a bounding box can be selected.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class BoundsSelectorModal extends Component {
  state = {
    active: false,
    lat: 0,
    lng: 0,
  }

  dismiss = (defaultBounds) => {
    this.setState({active: false})

    if (this.state.mapBounds || defaultBounds) {
      const bbox = fromLatLngBounds(this.state.mapBounds || defaultBounds)

      if (bbox) {
        this.props.onChange(bbox.join(','))
      }
    }
  }

  render() {
    const boundingBox = this.props.value ?
      toLatLngBounds(_split(this.props.value, ',')) :
        this.props.bounding ? toLatLngBounds(bbox(this.props.bounding)) : null

    return (
      <React.Fragment>
        <button className="mr-button mr-button mr-button--small mr-ml-4"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            this.setState({active: true})
          }}>
          {this.props.buttonName}
        </button>

        {this.state.active &&
          <External>
            <Modal isActive wide onClose={() => this.dismiss()}>
              <div className="mr-overflow-y-auto mr-max-h-screen80">
                <div className="mr-bg-blue-dark mr-p-8 mr-text-white mr-text-center">
                  <div>
                    <h2 className="mr-text-yellow mr-text-2xl mr-mb-2">
                      <FormattedMessage {...messages.header} />
                    </h2>
                    <div className="form mr-mt-2 mr-py-2">
                      <p className="mr-mr-4 mr-text-md">
                        <FormattedMessage {...messages.primaryMessage} />
                      </p>
                    </div>

                  </div>
                  <div className={classNames("mr-bounds-selector-map", this.props.className)}>
                    <MapPane>
                      <Map bounds={boundingBox}
                           zoomControl={false}>
                        <ZoomControl className="mr-z-1000" position='topright' />
                        <SourcedTileLayer source={defaultLayerSource()} skipAttribution={true} />
                        <AreaSelect onBoundsChanged={(mapBounds) => this.setState({mapBounds})} />
                      </Map>
                    </MapPane>
                  </div>
                  <div className="mr-text-center mr-mt-6">
                    <button className="mr-button" onClick={() => this.dismiss(boundingBox)}>
                      <FormattedMessage {...messages.dismiss} />
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </External>
        }
      </React.Fragment>
    )
  }
}
