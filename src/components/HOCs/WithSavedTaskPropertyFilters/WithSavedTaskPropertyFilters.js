import React from 'react'
import { buildSearchURL } from '../../../services/SearchCriteria/SearchCriteria'

const WithSavedTaskPropertyFilters = (WrappedComponent) => {
  return function(props) {
    const getSavedTaskPropertyFilters = () => {
      return this.props.getUserAppSetting(
        this.props.user, 'savedTaskPropertyFilters') || {}
    }

    const saveCurrentTaskPropertyFilters = (currentFilters) => {
      console.log('currentFilters in taskprop filter save', currentFilters)
      const searchURL = buildSearchURL(currentFilters)
      console.log('searchurl from taskprop filter save', searchURL)
    }

    return (
      <WrappedComponent {...props}
        saveCurrentTaskPropertyFilters={saveCurrentTaskPropertyFilters} 
        savedTaskPropertyFilters={getSavedTaskPropertyFilters}
      />
    )
  }
}

export default WithSavedTaskPropertyFilters