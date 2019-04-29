import React, { Component } from 'react'
import { connect } from 'react-redux'
import _omit from 'lodash/omit'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _cloneDeep from 'lodash/cloneDeep'
import { fetchClusteredReviewTasks }
       from '../../../services/Task/TaskReview/TaskReview'
import L from 'leaflet'
import { MAPBOX_LIGHT,
         OPEN_STREET_MAP }
       from '../../../services/VisibleLayer/LayerSources'


/**
 * WithReviewTaskClusters retrieves clusters for the currently filtered review tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTaskClusters = function(WrappedComponent) {
  return class extends Component {
    state = {
      loading: false,
      taskMarkers: [],
    }

    update(props, bounds) {
      let boundingBox = bounds

      const criteria = _cloneDeep(props.reviewCriteria)
      criteria.boundingBox = boundingBox
      props.updateReviewTasks(criteria)
    }

    updateClusters(props) {
      this.setState({loading: true})

      props.updateReviewClusters(props.reviewTasksType, props.reviewCriteria).then((clusters) => {
        const markers = []
        _each(clusters, (cluster) => {
          markers.push({
            position: [cluster.point.lat, cluster.point.lng],
            options: {...cluster},
            icon: this.markerIcon(cluster),
          })
        })

        this.setState({loading: false, taskMarkers: markers, clusters})
      })
    }

    componentDidMount() {
      this.updateClusters(this.props)
    }

    componentDidUpdate(prevProps) {
      if (prevProps.reviewTasksType !== this.props.reviewTasksType) {
        this.updateClusters(this.props)
      }

      if (prevProps.reviewCriteria !== this.props.reviewCriteria) {
        this.updateClusters(this.props)
      }
    }

    markerIcon = cluster => {
      if (_get(cluster, 'numberOfPoints') > 1) {
        let colorScheme = null
        switch(_get(this.props, 'source.name')) {
          case MAPBOX_LIGHT:
            colorScheme = 'monochromatic-blue-cluster'
            break;
          case OPEN_STREET_MAP:
            colorScheme = 'monochromatic-brown-cluster'
            break;
          default:
            colorScheme = 'greyscale-cluster'
            break;
        }

        const count = cluster.numberOfPoints
        let clusterSizeClass = ''

        if (count < 10) {
          clusterSizeClass = 'few'
        }
        else if (count > 100) {
          clusterSizeClass = 'many'
        }

        return L.divIcon({
          html: `<span class="count">${count}</span>`,
          className: `${colorScheme} ${clusterSizeClass}`,
          iconSize: L.point(40, 40),
        })
      }
      else {
        return new L.Icon.Default()
      }
    }


    render() {
      return (
        <WrappedComponent reviewClusters = {this.props.reviewClusters}
                          taskMarkers = {this.state.taskMarkers}
                          updateReview={(bounds) => this.update(this.props, bounds)}
                          loading={this.state.loading}
                          {..._omit(this.props, ['updateReviewClusters'])} />)
    }
  }
}

const mapStateToProps = state => ({ reviewClusters: _get(state, 'currentReviewTasks.clusters') })

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateReviewClusters: (reviewTasksType, searchCriteria={}) => {
    return dispatch(fetchClusteredReviewTasks(reviewTasksType, searchCriteria))
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithReviewTaskClusters(WrappedComponent))
