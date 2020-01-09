import React, { Component } from 'react'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _isEqual from 'lodash/isEqual'
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'
import _omit from 'lodash/omit'
import _sortBy from 'lodash/sortBy'
import { fromLatLngBounds } from '../../../services/MapBounds/MapBounds'
import { fetchPropertyKeys } from '../../../services/Challenge/Challenge'

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_CRITERIA = {sortCriteria: {sortBy: 'name', direction: 'DESC'},
                          pageSize: DEFAULT_PAGE_SIZE, filters:{}}

/**
 * WithFilterCriteria keeps track of the current criteria being used
 * to filter, sort and page the tasks.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithFilterCriteria = function(WrappedComponent) {
   return class extends Component {
     state = {
       loading: false,
       criteria: DEFAULT_CRITERIA,
       pageSize: DEFAULT_PAGE_SIZE,
       taskPropertyKeys: null,
     }

     updateCriteria = (newCriteria) => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.sortCriteria = newCriteria.sortCriteria
       criteria.page = newCriteria.page
       this.setState({criteria})
     }

     updateTaskFilterBounds = (bounds, zoom) => {
       const newCriteria = _cloneDeep(this.state.criteria)
       newCriteria.boundingBox = fromLatLngBounds(bounds)
       newCriteria.zoom = zoom

       if (!this.state.initialBounds) {
         // We need to save our first time initialBounds so that if we clear all
         // filters we have an initial bounding box to come back to.
         this.setState({criteria: newCriteria,
                        initialBounds: fromLatLngBounds(bounds),
                        initialZoom: zoom})
       }
       else {
         this.setState({criteria: newCriteria})
       }
     }

     updateTaskPropertyCriteria = (propertySearch) => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.filters.taskPropertySearch = propertySearch
       this.setState({criteria})
     }

     clearTaskPropertyCriteria = () => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.filters.taskPropertySearch = null
       this.setState({criteria})
     }

     clearAllFilters = () => {
       if (this.props.clearAllFilters) {
         this.props.clearAllFilters()
       }

       const newCriteria = _cloneDeep(DEFAULT_CRITERIA)
       newCriteria.boundingBox = this.state.initialBounds
       newCriteria.zoom = this.state.zoom
       newCriteria.filters["status"] = _keys(_pickBy(this.props.includeTaskStatuses, (s) => s))
       newCriteria.filters["reviewStatus"] = _keys(_pickBy(this.props.includeReviewStatuses, (r) => r))
       newCriteria.filters["priorities"] = _keys(_pickBy(this.props.includeTaskPriorities, (p) => p))

       this.setState({criteria: newCriteria})
     }

     refresh = () => {
       this.update(this.props, this.state.criteria)
     }

     changePageSize = (pageSize) => {
       const typedCriteria = _cloneDeep(this.state.criteria)
       typedCriteria.pageSize = pageSize
       this.setState({criteria: typedCriteria})
     }

     setFiltered = (column, value) => {
       const typedCriteria = _cloneDeep(this.state.criteria)
       typedCriteria.filters[column] = value

       //Reset Page so it goes back to 0
       typedCriteria.page = 0
       this.setState({criteria: typedCriteria})
     }

     taskPropertyKeys = () => {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId

       if (this.state.taskPropertyKeys) {
         return this.state.taskPropertyKeys
       }
       else if (challengeId && !this.state.loadingPropertyKeys){
         this.setState({loadingPropertyKeys: true})
         fetchPropertyKeys(challengeId).then( (results) => {
           this.setState({loadingPropertyKeys: false, taskPropertyKeys: _sortBy(results)})
           return results
         }).catch(error => {
           console.log(error)
           this.setState({loadingPropertyKeys: false, taskPropertyKeys: []})
         })
         return []
       }
       else {
         return []
       }
     }

     updateIncludedFilters(props) {
       const typedCriteria = _cloneDeep(this.state.criteria)
       typedCriteria.filters["status"] = _keys(_pickBy(props.includeTaskStatuses, (s) => s))
       typedCriteria.filters["reviewStatus"] = _keys(_pickBy(props.includeTaskReviewStatuses, (r) => r))
       typedCriteria.filters["priorities"] = _keys(_pickBy(props.includeTaskPriorities, (p) => p))
       this.setState({criteria: typedCriteria})
     }

     update(props, criteria) {
       const pageSize = _get(this.state.criteria, 'pageSize') || DEFAULT_PAGE_SIZE

       const typedCriteria = _cloneDeep(this.state.criteria)
       typedCriteria.pageSize = pageSize

       this.setState({criteria: typedCriteria})
     }

     refreshTasks = () => {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId
       this.setState({loading: true})

       this.props.augmentClusteredTasks(challengeId, false,
                                        this.state.criteria,
                                        this.state.criteria.pageSize,
                                        false).then((results) => {
         this.setState({loading: false})
       })
     }

     componentDidMount() {
       this.updateIncludedFilters(this.props)
     }

     componentDidUpdate(prevProps, prevState) {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId
       if (!challengeId) {
         return
       }

       if (prevProps.includeTaskStatuses !== this.props.includeTaskStatuses ||
           prevProps.includeTaskReviewStatuses !== this.props.includeTaskReviewStatuses ||
           prevProps.includeTaskPriorities !== this.props.includeTaskPriorities) {
         this.updateIncludedFilters(this.props)
       }

       if (!_isEqual(prevState.criteria, this.state.criteria) && !this.props.skipRefreshTasks) {
         if (this.state.criteria.boundingBox) {
           this.refreshTasks()
         }
       }
     }

     render() {
       const criteria = this.state.criteria || DEFAULT_CRITERIA
       return (
         <WrappedComponent defaultPageSize={DEFAULT_PAGE_SIZE}
                           updateTaskFilterBounds={this.updateTaskFilterBounds}
                           updateReviewTasks={(criteria) => this.update(this.props, criteria)}
                           updateTaskPropertyCriteria={this.updateTaskPropertyCriteria}
                           clearTaskPropertyCriteria={this.clearTaskPropertyCriteria}
                           taskPropertyKeys={this.taskPropertyKeys()}
                           refresh={this.refresh}
                           criteria={criteria}
                           pageSize={criteria.pageSize}
                           page={criteria.page}
                           changePageSize={this.changePageSize}
                           setFiltered={this.setFiltered}
                           loadingTasks={this.state.loading}
                           updateCriteria={this.updateCriteria}
                           refreshTasks={this.refreshTasks}
                           clearAllFilters={this.clearAllFilters}
                           {..._omit(this.props, ['loadingChallenge', 'clearAllFilters'])} />)
     }
   }
 }

export default WrappedComponent => WithFilterCriteria(WrappedComponent)
