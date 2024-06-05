import React from 'react'
import _unset from 'lodash/unset'
import { buildSearchURL } from '../../../services/SearchCriteria/SearchCriteria'
import queryString from 'query-string'

const WithSavedTaskPropertyFilters = (WrappedComponent) => {
  return function(props) {
    const getSavedTaskPropertyFilters = () => {
      return props.getUserAppSetting(
        props.user, 'savedTaskPropertyFilters') || {}
    }

    const saveCurrentTaskPropertyFilters = (currentFilters, filterName) => {
      const propertyCriteriaURL = new URLSearchParams({"filters.taskPropertySearch": JSON.stringify(currentFilters)}).toString()
      const currentSavedFilters = props.getUserAppSetting(props.user, 'savedTaskPropertyFilters') || {}
      currentSavedFilters[filterName] = propertyCriteriaURL
      props.updateUserAppSetting(props.user.id,
        {'savedTaskPropertyFilters': currentSavedFilters})
    }

    const removeSelectedPropertyFilter = (filterName) => {
      const currentSavedFilters = props.getUserAppSetting(props.user, 'savedTaskPropertyFilters') || {}
      _unset(currentSavedFilters, filterName)
      props.updateUserAppSetting(props.user.id,
        {'savedTaskPropertyFilters': currentSavedFilters})
    }

    const savedRules = getSavedTaskPropertyFilters()

    return (
      <WrappedComponent {...props}
        saveCurrentTaskPropertyFilters={saveCurrentTaskPropertyFilters} 
        removeSelectedPropertyFilter={removeSelectedPropertyFilter}
        savedTaskPropertyFilters={savedRules}
      />
    )
  }
}

export default WithSavedTaskPropertyFilters