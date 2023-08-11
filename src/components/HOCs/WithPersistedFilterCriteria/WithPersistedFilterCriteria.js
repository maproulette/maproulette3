import React, { Component } from 'react'
import _get from 'lodash/get'
import _cloneDeep from 'lodash/cloneDeep'
import _isEqual from 'lodash/isEqual'
import _keys from 'lodash/keys'
import _pickBy from 'lodash/pickBy'
import _omit from 'lodash/omit'
import _merge from 'lodash/merge'
import _toInteger from 'lodash/toInteger'
import _each from 'lodash/each'
import _isUndefined from 'lodash/isUndefined'
import _debounce from 'lodash/debounce'
import { fromLatLngBounds, GLOBAL_MAPBOUNDS } from '../../../services/MapBounds/MapBounds'
import { buildSearchCriteriafromURL} from '../../../services/SearchCriteria/SearchCriteria'

const DEFAULT_PAGE_SIZE = 20
const DEFAULT_CRITERIA = {sortCriteria: {sortBy: 'name', direction: 'DESC'},
                          pageSize: DEFAULT_PAGE_SIZE, filters:{},
                          invertFields: {}}

/**
 * WithPersistedFilterCriteria keeps track of the current criteria being used
 * to filter, sort and page the tasks. It is a streamlined version of 
 * WithFilterCriteria used in the context of the TaskBundleWidget to persisted
 * filter state beyond task resolution. An upstream WithSavedFilters HOC provides
 * the method props for coding and decoding filters formatted as URL search parameters
 * (as these methods are used elsewhere in the app in other contexts), and also
 * for saving the filter string as a user app setting in the database.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */
export const WithFilterCriteria = function(WrappedComponent, ignoreURL = true,
  ignoreLocked = true, skipInitialFetch = false) {
   return class extends Component {
     state = {
       loading: false,
       criteria: DEFAULT_CRITERIA,
       pageSize: DEFAULT_PAGE_SIZE,
     }

     updateCriteria = (newCriteria) => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.sortCriteria = newCriteria.sortCriteria
       criteria.page = newCriteria.page
       criteria.filters = newCriteria.filters
       criteria.includeTags = newCriteria.includeTags
       this.setState({criteria})
       if (this.props.setSearchFilters) {
         this.props.setSearchFilters(criteria)
       }

       // We need to update the saved filter string with the new criteria
       // along with local state.
       if(this.props.saveCurrentSearchFilters) {
        console.log('savecurrentsearchfilters ran')
        this.props.saveCurrentSearchFilters('taskBundleFilters', criteria)
       }
     }

     updateTaskFilterBounds = (bounds, zoom) => {
       const newCriteria = _cloneDeep(this.state.criteria)
       newCriteria.boundingBox = fromLatLngBounds(bounds)
       newCriteria.zoom = zoom
       this.setState({criteria: newCriteria})
     }

     updateTaskPropertyCriteria = (propertySearch) => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.filters.taskPropertySearch = propertySearch
       this.setState({criteria})
     }

     invertField = (fieldName) => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.invertFields[fieldName] = !criteria.invertFields[fieldName]
       this.setState({criteria})
       if (this.props.setSearchFilters) {
         this.props.setSearchFilters(criteria)
       }
     }

     clearTaskPropertyCriteria = () => {
       const criteria = _cloneDeep(this.state.criteria)
       criteria.filters.taskPropertySearch = null
       this.setState({criteria})
     }

     // This will clear all filters but also update the map, which is less useful for task
     // completion than other applications.
     clearAllFilters = () => {
       if (this.props.clearAllFilters) {
         this.props.clearAllFilters()
       }

       const newCriteria = _cloneDeep(DEFAULT_CRITERIA)

       newCriteria.boundingBox = null
       newCriteria.zoom = this.state.zoom
       newCriteria.filters["status"] = _keys(_pickBy(this.props.includeTaskStatuses, (s) => s))
       newCriteria.filters["reviewStatus"] = _keys(_pickBy(this.props.includeReviewStatuses, (r) => r))
       newCriteria.filters["metaReviewStatus"] = _keys(_pickBy(this.props.includeMetaReviewStatuses, (r) => r))
       newCriteria.filters["priorities"] = _keys(_pickBy(this.props.includeTaskPriorities, (p) => p))


       if (!ignoreURL) {
         this.props.history.push({
           pathname: this.props.history.location.pathname,
           state: {refresh: true}
         })
       }

       this.setState({criteria: newCriteria, loading: true})

       // If using saved filters, the clear function needs to also reset them to default
       if(this.props.saveCurrentSearchFilters && this.props.savedFilters['taskBundleFilters']) {
        this.props.removeSavedFilters('taskBundleFilters')
       }
     }

     // Alternate clear function to maintain map zoom and bounding box when clearing filters
     clearAllFiltersAndMaintainMapState = () => {

      // Runs upstream clear function, specifically in HOCs that manage filter state and pass filter statuses to this component.
      if (this.props.clearAllFilters) {
         this.props.clearAllFilters()
       }

       const newCriteria = _cloneDeep(DEFAULT_CRITERIA)

       newCriteria.boundingBox = this.state.criteria.boundingBox
       newCriteria.zoom = this.state.criteria.zoom
       newCriteria.filters["status"] = _keys(_pickBy(this.props.includeTaskStatuses, (s) => s))
       newCriteria.filters["reviewStatus"] = _keys(_pickBy(this.props.includeReviewStatuses, (r) => r))
       newCriteria.filters["metaReviewStatus"] = _keys(_pickBy(this.props.includeMetaReviewStatuses, (r) => r))
       newCriteria.filters["priorities"] = _keys(_pickBy(this.props.includeTaskPriorities, (p) => p))
       newCriteria.sortCriteria = {sortBy: 'name', direction: 'DESC'}

       this.setState({criteria: newCriteria, loading: true})

       // If using saved filters, the clear function needs to also reset them to default
       if(this.props.saveCurrentSearchFilters && this.props.savedFilters['taskBundleFilters']) {
        this.props.removeSavedFilters('taskBundleFilters')
       }
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

     updateIncludedFilters(props, criteria = {}) {
       const typedCriteria = _merge({}, criteria, _cloneDeep(this.state.criteria))
       typedCriteria.filters["status"] = _keys(_pickBy(props.includeTaskStatuses, (s) => s))
       typedCriteria.filters["reviewStatus"] = _keys(_pickBy(props.includeTaskReviewStatuses, (r) => r))
       typedCriteria.filters["metaReviewStatus"] = _keys(_pickBy(props.includeMetaReviewStatuses, (r) => r))
       typedCriteria.filters["priorities"] = _keys(_pickBy(props.includeTaskPriorities, (p) => p))
       this.setState({criteria: typedCriteria})
       return typedCriteria
     }

     refreshTasks = (typedCriteria) => {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId

       this.setState({loading: true})
       const criteria = typedCriteria || _cloneDeep(this.state.criteria)
       criteria.filters.archived = true;

       // If we don't have bounds yet, we still want results so let's fetch all
       // tasks globally for this challenge.
       if (!criteria.boundingBox) {
         if (skipInitialFetch || !challengeId) {
           return
         }
         criteria.boundingBox = GLOBAL_MAPBOUNDS
       }

       this.debouncedTasksFetch(challengeId, criteria, this.state.criteria.pageSize)
     }

     // Debouncing to give a chance for filters and bounds to all be applied before
     // making the server call.
     debouncedTasksFetch = _debounce(
       (challengeId, criteria, pageSize) => {
         this.props.augmentClusteredTasks(challengeId, false,
                                        criteria,
                                        pageSize,
                                        false, ignoreLocked).then(() => {
          this.setState({loading: false})
       })
     }, 800)

     updateCriteriaFromSavedFilters(filterString) {
      const criteria = buildSearchCriteriafromURL(filterString)

      // These values will come in as comma-separated strings and need to be turned
      // into number arrays
      _each(["status", "reviewStatus", "metaReviewStatus", "priorities", "boundingBox"], key => {
        if (!_isUndefined(criteria[key]) && key === "boundingBox") {
          if (typeof criteria[key] === "string") {
            criteria[key] = criteria[key].split(',').map(x => parseFloat(x))
          }
        }
        else if (!_isUndefined(_get(criteria, `filters.${key}`))) {
          if (typeof criteria.filters[key] === "string") {
            criteria.filters[key] = criteria.filters[key].split(',').map(x => _toInteger(x))
          }
        }
      })

      if (!_get(criteria, 'filters.status')) {
        this.updateIncludedFilters(this.props)
      }
      else {
        this.setState({criteria})
      }
     }

     componentDidMount() {
      
        if(this.props.savedFilters && this.props.savedFilters['taskBundleFilters']) {
          this.updateCriteriaFromSavedFilters(this.props.savedFilters['taskBundleFilters'])
        } 
        else {
          this.updateIncludedFilters(this.props)
        }
     }

     componentDidUpdate(prevProps, prevState) {
       const challengeId = _get(this.props, 'challenge.id') || this.props.challengeId
       if (!challengeId) {
         return
       }

       let typedCriteria = _cloneDeep(this.state.criteria)

       if (prevProps.includeTaskStatuses !== this.props.includeTaskStatuses ||
           prevProps.includeTaskReviewStatuses !== this.props.includeTaskReviewStatuses ||
           prevProps.includeMetaReviewStatuses !== this.props.includeMetaReviewStatuses ||
           prevProps.includeTaskPriorities !== this.props.includeTaskPriorities) {
         typedCriteria = this.updateIncludedFilters(this.props)
         return
       }

       if (!_isEqual(prevState.criteria, this.state.criteria) && !this.props.skipRefreshTasks) {
         this.refreshTasks(typedCriteria)
       }
       else if (_get(prevProps, 'challenge.id') !== _get(this.props, 'challenge.id') ||
                this.props.challengeId !== prevProps.challengeId) {
         this.refreshTasks(typedCriteria)
         this.clearAllFilters()
       }
       else if (_get(this.props.history.location, 'state.refreshAfterSave')) {
         this.refreshTasks(typedCriteria)
       }
     }

     render() {
       const criteria = _cloneDeep(this.state.criteria) || DEFAULT_CRITERIA

       return (
         <WrappedComponent defaultPageSize={DEFAULT_PAGE_SIZE}
                           updateTaskFilterBounds={this.updateTaskFilterBounds}
                           updateTaskPropertyCriteria={this.updateTaskPropertyCriteria}
                           clearTaskPropertyCriteria={this.clearTaskPropertyCriteria}
                           invertField={this.invertField}
                           criteria={criteria}
                           pageSize={criteria.pageSize}
                           page={criteria.page}
                           changePageSize={this.changePageSize}
                           setFiltered={this.setFiltered}
                           loadingTasks={this.state.loading}
                           updateCriteria={this.updateCriteria}
                           refreshTasks={this.refreshTasks}
                           clearAllFilters={this.clearAllFilters}
                           clearAllFiltersAndMaintainMapState={this.clearAllFiltersAndMaintainMapState}
                           {..._omit(this.props, ['loadingChallenge', 'clearAllFilters'])} />)
     }
   }
 }

export default (WrappedComponent, ignoreURL, ignoreLocked, skipInitialFetch) =>
  WithFilterCriteria(WrappedComponent, ignoreURL, ignoreLocked, skipInitialFetch)
