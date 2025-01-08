import { useRef, useEffect } from 'react'
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
const MapillaryViewer = ({ initialImageKey, onClose }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!viewerRef.current) {
      viewerRef.current = new Viewer({
        accessToken: getAccessToken(),
        container: containerRef.current,
        imageId: initialImageKey,
        component: { cover: false },
      });
    }

    return () => {
      // Cleanup if necessary
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.moveTo(initialImageKey);
    }
  }, [initialImageKey]);

  return (
    <External>
      <Modal isActive onClose={onClose}>
        <div className="mr-p-2 mr-pt-4 mr-relative mr-m-auto" style={{ width: 640 }}>
          <div ref={containerRef} id="mapillary-viewer" style={{ width: 640, height: 480 }}></div>
        </div>
      </Modal>
    </External>
  );
}

MapillaryViewer.propTypes = {
  initialImageKey: PropTypes.string.isRequired,
  onClose: PropTypes.func,
}

export default MapillaryViewer;
