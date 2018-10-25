import React, { Component } from 'react'

const DashboardFilterToggle = (filterType, filterName) => {
  return class extends Component {
    render() {
      return (
        <div className={`${filterType}-dashboard__${filterName}-filter dashboard__filter`}>
          <input type="checkbox"
                checked={this.props.dashboardEntityFilters[filterName]}
                onChange={() => this.props.toggleEntityFilter(filterName)} /> {this.props.filterToggleLabel}
        </div>
      )
    }
  }
}

export default DashboardFilterToggle
