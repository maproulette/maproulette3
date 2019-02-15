import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _findIndex from 'lodash/findIndex'
import Modal from '../Bulma/Modal'
import SvgControl from '../Bulma/SvgControl'
import WithDeactivateOnOutsideClick
       from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import './MapillaryViewer.scss'

export class MapillaryViewer extends Component {
  state = {
    currentIndex: -1,
  }

  componentDidMount() {
    this.setState({
      currentIndex: _findIndex(this.props.images, {key: this.props.initialImageKey})
    })
  }

  canPrevious = () => this.state.currentIndex > 0

  canNext = () => this.state.currentIndex < this.props.images.length - 1

  previousImage = () => {
    if (this.canPrevious()) {
      this.setState({currentIndex: this.state.currentIndex - 1})
    }
  }

  nextImage = () => {
    if (this.canNext()) {
      this.setState({currentIndex: this.state.currentIndex + 1})
    }
  }

  render() {
    if (this.state.currentIndex === -1) {
      return null
    }

    const image = this.props.images[this.state.currentIndex]

    return (
      <Modal className="mapillary-viewer"
             onClose={this.props.deactivate} isActive={this.props.isActive}>
        <article className="message">
          <div className="message-header">
            {this.canPrevious() &&
             <SvgControl sym="arrow-left-icon" onClick={this.previousImage} />
            }
            {this.canNext() &&
             <SvgControl sym="arrow-right-icon" onClick={this.nextImage} />
            }
          </div>

          <div className="message-body">
            <img src={image.url_1024} alt="From Mapillary"
                 onClick={this.props.deactivate} />
            <div className="mapillary-viewer__license">Images from Mapillary, CC BY-SA</div>
          </div>
        </article>
      </Modal>
    )
  }
}

MapillaryViewer.propTypes = {
  images: PropTypes.array.isRequired,
  initialImageKey: PropTypes.string.isRequired,
}

export default WithDeactivateOnOutsideClick(MapillaryViewer, true)
