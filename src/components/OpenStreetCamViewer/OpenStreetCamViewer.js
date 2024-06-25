import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { parseISO,format } from 'date-fns'
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
export default class OpenStreetCamViewer extends Component {
  state = {
    currentIndex: -1,
    imageLoaded: false,
  }

  hasNextImage = () => {
    return this.state.currentIndex !== -1 &&
           this.state.currentIndex < this.props.images.length - 1
  }

  nextImage = () => {
    this.setState({
      currentIndex: this.state.currentIndex + 1,
      imageLoaded: false
    })
  }

  hasPriorImage = () => {
    return this.state.currentIndex !== -1 &&
           this.state.currentIndex > 0
  }

  priorImage = () => {
    this.setState({
      currentIndex: this.state.currentIndex - 1,
      imageLoaded: false,
    })
  }

  componentDidMount() {
    this.setState({
      currentIndex: _findIndex(this.props.images, {key: this.props.initialImageKey}),
    })
  }

  render() {
    const currentImage =
      this.state.currentIndex === -1 ?
      null :
      this.props.images[this.state.currentIndex]

    return (
      <External>
        <Modal isActive onClose={this.props.onClose}>
          <div className="mr-flex mr-flex-col mr-justify-center">
            <div className="mr-flex mr-justify-center">
              <div className="mr-flex mr-justify-between mr-bg-black-15 mr-rounded mr-p-2">
                <div>
                  {this.hasPriorImage() &&
                   <button onClick={this.priorImage}>
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
                  {this.hasNextImage() &&
                   <button onClick={this.nextImage}>
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

            <div>
              {currentImage &&
               <div>
                 <img
                   src={currentImage.url}
                   onLoad={() => this.setState({imageLoaded: true})}
                   alt=""
                 />
               </div>
              }

            </div>
            <div className="mr-flex mr-justify-center mr-mt-2 mr-min-h-4 mr-text-sm mr-text-white">
              {!this.state.imageLoaded ?
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
}

OpenStreetCamViewer.propTypes = {
  images: PropTypes.array.isRequired,
  onClose: PropTypes.func,
}
