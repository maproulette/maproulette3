import React, { Component } from 'react'
import queryString from 'query-string'
const WithMetricsFilter = function(WrappedComponent) {
    return class extends Component {
        render() {
            const params = queryString.parse(this.props.location.search)

            let entityFilters = {
                visible: params['visible'] === 'true',
                archived: params['archived'] === 'true'
            }

            const toggleFilter = (filterName) => {
                entityFilters[filterName] = !entityFilters[filterName]
                let searchquery = `?`
                searchquery += `visible=${entityFilters.visible}&`
                searchquery += `archived=${entityFilters.archived}`
                this.props.history.push({
                    pathname: '/superadmin',
                    search: searchquery
                })  
            }

            const challenges = entityFilters.visible ? this.props.challenges.filter(c => c.enabled) : this.props.challenges
            return <WrappedComponent {...this.props} 
                                    challenges = {challenges} 
                                    entityFilters = {entityFilters} 
                                    toggleFilter = {toggleFilter} />
        }
    }
}

export default (WrappedComponent) => WithMetricsFilter(WrappedComponent)