import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Viewer } from 'mapillary-js';
import { getAccessToken } from '../../services/Mapillary/Mapillary'
import External from '../External/External'
import Modal from '../Modal/Modal'

/**
 * Renders a [Mapillary Viewer](https://mapillary.github.io/mapillary-js/)
 * in a modal
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class MapillaryViewer extends Component {
  constructor() {
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    // this.viewer = new Viewer(
    //   'mapillary-viewer',
    //   getClientId(),
    //   this.props.initialImageKey, {
    //     component: {
    //       cover: false,
    //     }
    //   }
    // )

    this.viewer = Viewer({
      accessToken: getAccessToken(),
      container: this.containerRef.current,
      imageId: this.props.initialImageKey,
      component: { cover: false },
    })
    //.deactivateCover();
  }

  componentWillUnmount() {
    if (this.viewer) {
      this.viewer.remove();
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.initialImageKey !== this.props.initialImageKey
  }

  render() {
    return (
      <External>
        <Modal isActive onClose={this.props.onClose}>
          <div className="mr-p-2 mr-pt-4 mr-relative">
            <div ref={this.containerRef} id="mapillary-viewer" style={{width: '640px', height: '480px'}}></div>
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
