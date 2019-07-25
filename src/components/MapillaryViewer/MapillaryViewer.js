import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as Mapillary from 'mapillary-js'
import { getClientId } from '../../services/Mapillary/Mapillary'
import External from '../External/External'
import Modal from '../Modal/Modal'

/**
 * Renders a [Mapillary Viewer](https://mapillary.github.io/mapillary-js/)
 * in a modal
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MapillaryViewer extends Component {
  componentDidMount() {
    this.viewer = new Mapillary.Viewer(
      'mapillary-viewer',
      getClientId(),
      this.props.initialImageKey, {
        component: {
          cover: false,
        }
      }
    )
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.initialImageKey !== this.props.initialImageKey
  }

  render() {
    return (
      <External>
        <Modal isActive onClose={this.props.onClose}>
          <div className="mr-p-2 mr-pt-4 mr-relative">
            <div id="mapillary-viewer" style={{width: '640px', height: '480px'}}></div>
          </div>
        </Modal>
      </External>
    )
  }
}

MapillaryViewer.propTypes = {
  initialImageKey: PropTypes.string.isRequired,
  onClose: PropTypes.func,
}
