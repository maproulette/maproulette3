import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _map from 'lodash/map'
import _uniqBy from 'lodash/uniqBy'
import {
  isOpenStreetCamEnabled,
  fetchOpenStreetCamImages,
  openStreetCamImageUrl,
  hasMoreOpenStreetCamResults,
  nextOpenStreetCamPage,
} from '../../../services/OpenStreetCam/OpenStreetCam'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * Provides WrappedComponent with the ability to fetch images from OpenStreetCam
 * for a given task
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithOpenStreetCamImages = function(WrappedComponent) {
  return class extends Component {
    state = {
      taskId: null,
      openStreetCamLoading: false,
      openStreetCamResults: null,
      openStreetCamImages: null,
    }

    /**
     * Retrieve openStreetCam images within the given LatLngBounds for the given
     * task. Up to 1000 images will be retrieved -- use
     * `fetchMoreOpenStreetCamImagery` to retrieve additional images -- and passed
     * down to the WrappedComponent
     */
    fetchOpenStreetCamImagery = async (bounds, task) => {
      if (this.state.loadingFailed) {
        return
      }

      try {
        this.setState({taskId: task.id, openStreetCamLoading: true})
        const results = await fetchOpenStreetCamImages(bounds.toBBoxString())
        this.setState({
          openStreetCamLoading: false,
          openStreetCamResults: results,
          openStreetCamImages: this.extractImages(results.currentPageItems),
        })
      }
      catch(error) {
        this.setState({openStreetCamLoading: false, loadingFailed: true})
        this.props.addError(AppErrors.openStreetCam.fetchFailure)
      }
    }

    /**
     * Fetch the next page of image results from OpenStreetCam. This concatenates
     * the new results onto the existing results, making all available to the
     * WrappedComponent
     */
    fetchMoreOpenStreetCamImagery = async () => {
      if (!this.state.openStreetCamResults) {
        return
      }

      if (this.state.loadingFailed) {
        return
      }

      try {
        this.setState({openStreetCamLoading: true})
        const results = await nextOpenStreetCamPage(this.state.openStreetCamResults.context)

        this.setState({
          openStreetCamLoading: false,
          openStreetCamResults: results,
          openStreetCamImages: _uniqBy(
            this.state.openStreetCamImages.concat(this.extractImages(results.currentPageItems)),
            'key'
          ),
        })
      }
      catch(error) {
        this.setState({openStreetCamLoading: false, loadingFailed: true})
        this.props.addError(AppErrors.openStreetCam.fetchFailure)
      }
    }

    /**
     * Extract the needed image information required to map and display the images
     *
     * @private
     */
    extractImages = imageItems => {
      return _map(imageItems, item => ({
        key: item.id,
        lon: item.lng,
        lat: item.lat,
        url: openStreetCamImageUrl(item, '200'),
        username: item.username,
        shotDate: item.shot_date,
      }))
    }

    render() {
      const hasMoreOpenStreetCamImagery =
        this.state.openStreetCamResults &&
        hasMoreOpenStreetCamResults(this.state.openStreetCamResults.context)

      return (
        <WrappedComponent
          {...this.props}
          isOpenStreetCamEnabled={isOpenStreetCamEnabled}
          fetchOpenStreetCamImagery={this.fetchOpenStreetCamImagery}
          openStreetCamTaskId={this.state.taskId}
          openStreetCamImages={this.state.openStreetCamImages}
          openStreetCamLoading={this.state.openStreetCamLoading}
          hasMoreOpenStreetCamImagery={hasMoreOpenStreetCamImagery}
          fetchMoreOpenStreetCamImagery={this.fetchMoreOpenStreetCamImagery}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => bindActionCreators({addError}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithOpenStreetCamImages(WrappedComponent))
