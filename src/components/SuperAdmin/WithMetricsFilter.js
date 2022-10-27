import React, { Component } from 'react'
import queryString from 'query-string'
const WithMetricsFilter = function(WrappedComponent) {
    return class extends Component {
        render() {
            const params = queryString.parse(this.props.location.search)

            let entityFilters = {
                visible: params['visible'] === 'true',
                archived: params['archived'] === 'true',
                virtual: params['virtual'] === 'true'
            }

            const toggleFilter = (filterName) => {
                entityFilters[filterName] = !entityFilters[filterName]
                let searchquery = `?`
                searchquery += `visible=${entityFilters.visible}&`
                searchquery += `archived=${entityFilters.archived}&`
                searchquery += `virtual=${entityFilters.virtual}`
                this.props.history.push({
                    pathname: '/superadmin',
                    search: searchquery
                })  
            }

            let challenges = entityFilters.visible ? this.props.challenges.filter(c => c.enabled) : this.props.challenges
            challenges = entityFilters.archived ? challenges.filter(c => c.isArchived) : challenges

            let projects = entityFilters.visible? this.props.projects.filter(p => p.enabled): this.props.projects
            projects = entityFilters.archived? projects.filter(p => p.isArchived): projects
            projects = entityFilters.virtual? projects.filter(p => p.isVirtual): projects
            return <WrappedComponent {...this.props} 
                                    challenges = {challenges} 
                                    projects={projects}
                                    entityFilters = {entityFilters} 
                                    toggleFilter = {toggleFilter} />
        }
    }
}

export default (WrappedComponent) => WithMetricsFilter(WrappedComponent)