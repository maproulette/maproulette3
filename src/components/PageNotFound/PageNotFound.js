import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { latLng } from 'leaflet'
import MapPane from '../EnhancedMap/MapPane/MapPane'
import EnhancedMap from '../EnhancedMap/EnhancedMap'
import SourcedTileLayer from '../EnhancedMap/SourcedTileLayer/SourcedTileLayer'
import { layerSourceWithId, OPEN_STREET_MAP }
       from '../../services/VisibleLayer/LayerSources'
import messages from './Messages'
import './PageNotFound.scss'

/**
 * PageNotFound displays a 404 message.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class PageNotFound extends Component {
  render() {
    return (
      <div className="page-not-found full-screen-height">
        <MapPane>
          <EnhancedMap center={latLng(0, 0)} zoom={17} zoomControl={false}>
            <SourcedTileLayer source={layerSourceWithId(OPEN_STREET_MAP)} />
          </EnhancedMap>
        </MapPane>

        <div className="page-not-found__message">
          <h1>404</h1>

          <h2><FormattedMessage {...messages.missingPage} /></h2>
          <span className="page-not-found__message__icon" role="img" aria-label="fish">🐠</span>

          <p>
            <FormattedMessage {...messages.returnTo} /> <Link to='/'>
              <FormattedMessage {...messages.homePage} />
            </Link>.
          </p>
        </div>
      </div>
    )
  }
}
