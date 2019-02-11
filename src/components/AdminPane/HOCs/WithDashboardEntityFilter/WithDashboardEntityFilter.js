import React, { Component } from 'react'
import _filter from 'lodash/filter'
import _clone from 'lodash/clone'
import _get from 'lodash/get'
import _set from 'lodash/set'
import _camelCase from 'lodash/camelCase'
import WithCurrentUser from '../../../HOCs/WithCurrentUser/WithCurrentUser'
import AsManager from '../../../../interactions/User/AsManager'

/**
 * WithDashboardEntityFilter filters the entities made available to the
 * dashboard such that only entities passing all enabled filters are allowed
 * through
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithDashboardEntityFilter = function(WrappedComponent,
                                           filterType,
                                           itemsProp,
                                           pinsProp,
                                           outputProp,
                                           passesFilterFunction) {
  return class extends Component {
    /**
     * Returns the name of the filter field based on the filter type
     *
     * @private
     */
    filterFieldName = () => `${filterType}Filters`

    /**
     * Sets the specified filter to the given value, saving the new setting to
     * the dashboard configuration.
     */
    setDashboardEntityFilter = (filterName, filterValue) => {
      const updatedFilters = _clone(this.props.currentConfiguration.filters) || {}
      _set(updatedFilters, `${this.filterFieldName()}.${filterName}`, filterValue)

      this.props.saveWorkspaceConfiguration(Object.assign(
        {},
        this.props.currentConfiguration,
        {filters: updatedFilters}
      ))
    }

    /**
     * Toggles the value of the given boolean filter, saving the new setting to
     * the dashboard configuration.
     */
    toggleDashboardEntityFilter = filterName => {
      const existingValue =
        _get(this.props.currentConfiguration.filters,
            `${this.filterFieldName()}.${filterName}`, false)

      this.setDashboardEntityFilter(filterName, !existingValue)
    }

    render() {
      if (!this.props.currentConfiguration) {
        return null
      }

      const manager = AsManager(this.props.user)
      const filters =
        _get(this.props.currentConfiguration.filters, this.filterFieldName(), {})

      const filteredDashboardEntities = _filter(this.props[itemsProp], entities =>
        passesFilterFunction(entities, manager, this.props[pinsProp], filters)
      )

      // Generate prop names based on filter type.
      return <WrappedComponent {...this.props}
                               {...{
                                     [outputProp]: filteredDashboardEntities,
                                     [_camelCase(`dashboard-${filterType}-Filters)`)]: filters,
                                     [_camelCase(`setDashboard-${filterType}-Filter`)]: this.setDashboardEntityFilter,
                                     [_camelCase(`toggleDashboard-${filterType}-Filter`)]: this.toggleDashboardEntityFilter,
                                   }
                               } />
    }
  }
}

export default (WrappedComponent, filterType, itemsProp, pinsProp, outputProp, passesFilterFunction) =>
  WithCurrentUser(
    WithDashboardEntityFilter(
      WrappedComponent, filterType, itemsProp, pinsProp, outputProp, passesFilterFunction
    )
  )
