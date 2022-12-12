import React, { Component } from 'react'
import queryString from 'query-string'

/**
 * Deals with superadmin query routes for super admin metrics.
 * Toggle filter logic here as well.
 */
const WithMetricsFilter = function(WrappedComponent) {
  return class extends Component {
    render() {
      const params = queryString.parse(this.props.location.search)
      const tab = params['tab'] 
      let entityFilters = {
        visible: params['hideUndiscoverable'] === 'true',
        archived: params['hideArchived'] === 'true',
        virtual: params['virtual'] === 'true',
        from : params['from'],
        to: params['to']
      }

      const toggleFilter = (filterName) => {
        entityFilters[filterName] = !entityFilters[filterName]
        let searchquery = `?`
        searchquery += `tab=${tab}&`
        searchquery += `hideUndiscoverable=${entityFilters.visible}&`
        searchquery += `hideArchived=${entityFilters.archived}&`
        searchquery += `virtual=${entityFilters.virtual}`
        this.props.history.push({
          pathname: '/superadmin',
          search: searchquery
        })  
      }

      const toggleStartDate = (startDate) => {
        entityFilters.from = startDate
        const newQueries = { ...params, from: startDate }
        this.props.history.push({
          pathname: '/superadmin',
          search: queryString.stringify(newQueries)
        })
      }

      const toggleEndDate = (endDate) => {
        entityFilters.to = endDate
        const newQueries = { ...params, to: endDate }
        this.props.history.push({
          pathname: '/superadmin',
          search: queryString.stringify(newQueries)
        })
      }

      const clearDateFilter = () => {
        const newQueries = {...params, from: undefined, to: undefined}
         this.props.history.push({
          pathname: '/superadmin',
          search: queryString.stringify(newQueries)
        })
      }

      let challenges = this.props.challenges
      let projects = this.props.projects
      let users = this.props.adminUsers
      let startDate = new Date (entityFilters.from)
      let endDate = new Date(entityFilters.to)

      if (tab === 'challenges') {
        challenges = entityFilters.visible ? this.props.challenges.filter(c => c.enabled) : this.props.challenges
        challenges = entityFilters.archived ? challenges.filter(c => !c.isArchived) : challenges
        challenges = entityFilters.from ? challenges.filter(c => {
          const date = new Date(c.created)
          return date >= startDate
        }) : challenges
        challenges = entityFilters.to ? challenges.filter(c => {
          const date = new Date(c.created)
          return date <= endDate
        }) : challenges
      }
      else if (tab === 'projects') {
        projects = entityFilters.visible ? this.props.projects.filter(p => p.enabled) : this.props.projects
        projects = entityFilters.archived ? projects.filter(p => !p.isArchived) : projects
        projects = entityFilters.virtual ? projects.filter(p => p.isVirtual) : projects
        projects = entityFilters.from ? projects.filter(p => {
          const date = new Date(p.created)
          return date >= startDate
        }) : projects
        projects = entityFilters.to ? projects.filter(p => {
          const date = new Date(p.created)
          return date <= endDate
        }) : projects
      }
      else{
        users = entityFilters.from ? users.filter(user => {
          const date = new Date(user.created)
          return date >= startDate
        }) : users
    
        users = entityFilters.to ? users.filter(user => {
          const date = new Date(user.created)
          return date <= endDate
        }) : users
      }

      return (
        <WrappedComponent {...this.props}
          challenges={challenges}
          projects={projects}
          adminUsers={users}
          entityFilters={entityFilters}
          toggleFilter={toggleFilter}
          toggleStartDate={toggleStartDate}
          toggleEndDate={toggleEndDate}
          clearDateFilter={clearDateFilter}
        />
      )
    }
  }
}

export default (WrappedComponent) => WithMetricsFilter(WrappedComponent)
