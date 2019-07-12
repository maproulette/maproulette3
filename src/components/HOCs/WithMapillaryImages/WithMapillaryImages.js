import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _map from 'lodash/map'
import _uniqBy from 'lodash/uniqBy'
import { fetchMapillaryImages, mapillaryImageUrl,
         hasMoreMapillaryResults, nextMapillaryPage }
       from '../../../services/Mapillary/Mapillary'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'

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

    fetchMapillaryImagery = async (bounds, task) => {
      const point = AsMappableTask(task).calculateCenterPoint()
      const pointCoords = bounds.contains(point) ? [point.lng, point.lat] : null

      try {
        this.setState({taskId: task.id, mapillaryLoading: true})
        const results = await fetchMapillaryImages(bounds.toBBoxString(), pointCoords)
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
