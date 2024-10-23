import { createRef, Component } from 'react'
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
  containerRef = createRef();
  

  componentDidMount() {
    this.viewer = new Viewer({
      accessToken: getAccessToken(),
      container: this.containerRef.current,
      imageId: this.props.initialImageKey,
      component: { cover: false },
    })
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
          <div className="mr-p-2 mr-pt-4 mr-relative mr-m-auto" style={{ width: 640 }}>
            <div ref={this.containerRef} id="mapillary-viewer" style={{ width: 640, height: 480 }}></div>
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
