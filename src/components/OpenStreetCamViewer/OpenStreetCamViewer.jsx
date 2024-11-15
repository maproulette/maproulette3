import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { parseISO, format } from 'date-fns'
import _findIndex from 'lodash/findIndex'
import External from '../External/External'
import Modal from '../Modal/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import BusySpinner from '../BusySpinner/BusySpinner'

/**
 * Renders a viewer for OpenStreetCam imagery in a modal
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const OpenStreetCamViewer = ({ images, initialImageKey, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setCurrentIndex(_findIndex(images, { key: initialImageKey }))
  }, [images, initialImageKey])

  const hasNextImage = () => currentIndex !== -1 && currentIndex < images.length - 1
  const hasPriorImage = () => currentIndex !== -1 && currentIndex > 0

  const nextImage = () => {
    if (hasNextImage()) {
      setCurrentIndex(currentIndex + 1)
      setImageLoaded(false)
    }
  }

  const priorImage = () => {
    if (hasPriorImage()) {
      setCurrentIndex(currentIndex - 1)
      setImageLoaded(false)
    }
  }

  const currentImage = currentIndex === -1 ? null : images[currentIndex]

  return (
    <External>
      <Modal isActive onClose={onClose}>
        <div className="mr-flex mr-flex-col mr-justify-center">
          <div className="mr-flex mr-justify-center">
            <div className="mr-flex mr-justify-between mr-bg-black-15 mr-rounded mr-p-2">
              <div>
                {hasPriorImage() &&
                  <button onClick={priorImage}>
                    <SvgSymbol
                      sym="arrow-left-icon"
                      viewBox='0 0 20 20'
                      className="mr-h-4 mr-w-4 mr-fill-current"
                    />
                  </button>
                }
              </div>

              <div className="mr-w-4" />

              <div>
                {hasNextImage() &&
                  <button onClick={nextImage}>
                    <SvgSymbol
                      sym="arrow-right-icon"
                      viewBox='0 0 20 20'
                      className="mr-h-4 mr-w-4 mr-fill-current"
                    />
                  </button>
                }
              </div>
            </div>
          </div>

          <div className="mr-mt-2">
            {currentImage &&
              <img
                src={currentImage.url}
                onLoad={() => setImageLoaded(true)}
                alt=""
                className="mr-w-full mr-h-auto mr-rounded mr-shadow"
              />
            }
          </div>
          <div className="mr-flex mr-justify-center mr-mt-2 mr-min-h-4 mr-text-sm mr-text-white">
            {!imageLoaded ?
              <BusySpinner /> :
              <div className="mr-flex mr-items-center">
                <div className="mr-pr-4 mr-mr-4 mr-leading-tight mr-border-r mr-border-grey">
                  @{currentImage.username}
                </div>
                <div>
                  {format(parseISO(currentImage.shotDate), 'yyyy-MM-dd')}
                </div>
              </div>
            }
          </div>
        </div>
      </Modal>
    </External>
  )
}

OpenStreetCamViewer.propTypes = {
  images: PropTypes.array.isRequired,
  onClose: PropTypes.func,
}

export default OpenStreetCamViewer
