import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _map from 'lodash/map'
import _uniqBy from 'lodash/uniqBy'
import { isMapillaryEnabled,
         fetchMapillaryImages,
         mapillaryImageUrl,
         hasMoreMapillaryResults,
         nextMapillaryPage } from '../../../services/Mapillary/Mapillary'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * Provides WrappedComponent with the ability to fetch images from Mapillary
 * for a given task
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithMapillaryImages = function(WrappedComponent) {
  return class extends Component {
    state = {
      taskId: null,
      mapillaryLoading: false,
      mapillaryResults: null,
      mapillaryImages: null,
    }

    /**
     * Retrieve mapillary images within the given LatLngBounds for the given
     * task. Up to 1000 images will be retrieved -- use
     * `fetchMoreMapillaryImagery` to retrieve additional images -- and passed
     * down to the WrappedComponent
     */
    fetchMapillaryImagery = async (bounds, task) => {
      try {
        this.setState({taskId: task.id, mapillaryLoading: true})
        const results = await fetchMapillaryImages(bounds.toBBoxString())
        this.setState({
          mapillaryLoading: false,
          mapillaryResults: results,
          mapillaryImages: this.extractImages(results.geojson),
        })
      }
      catch(error) {
        this.setState({mapillaryLoading: false})
        this.props.addError(AppErrors.mapillary.fetchFailure)
      }
    }

    /**
     * Fetch the next page of image results from Mapillary. This concatenates
     * the new results onto the existing results, making all available to the
     * WrappedComponent
     */
    fetchMoreMapillaryImagery = async () => {
      if (!this.state.mapillaryResults) {
        return
      }

      try {
        this.setState({mapillaryLoading: true})
        const results = await nextMapillaryPage(this.state.mapillaryResults.context)

        this.setState({
          mapillaryLoading: false,
          mapillaryResults: results,
          mapillaryImages: _uniqBy(
            this.state.mapillaryImages.concat(this.extractImages(results.geojson)), 'key'
          ),
        })
      }
      catch(error) {
        this.setState({mapillaryLoading: false})
        this.props.addError(AppErrors.mapillary.fetchFailure)
      }
    }

    /**
     * Extract the needed image information required to map and display the images
     *
     * @private
     */
    extractImages = geojson => {
      return _map(geojson.features, feature => ({
        key: feature.properties.key,
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],
        url320: mapillaryImageUrl(feature.properties.key, '320'),
      }))
    }

    render() {
      const hasMoreMapillaryImagery =
        this.state.mapillaryResults && hasMoreMapillaryResults(this.state.mapillaryResults.context)

      return (
        <WrappedComponent
          {...this.props}
          isMapillaryEnabled={isMapillaryEnabled}
          fetchMapillaryImagery={this.fetchMapillaryImagery}
          mapillaryTaskId={this.state.taskId}
          mapillaryImages={this.state.mapillaryImages}
          mapillaryLoading={this.state.mapillaryLoading}
          hasMoreMapillaryImagery={hasMoreMapillaryImagery}
          fetchMoreMapillaryImagery={this.fetchMoreMapillaryImagery}
        />
      )
    }
  }
}

export const mapDispatchToProps = dispatch => bindActionCreators({addError}, dispatch)

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithMapillaryImages(WrappedComponent))
