import React, { Component } from 'react'

const DashboardFilterToggle = (filterType, filterName) => {
  return class extends Component {
    render() {
      return (
        <div className="mr-leading-none">
          <input
            type="checkbox"
            className="mr-checkbox-toggle mr-ml-4 mr-mr-1"
            checked={this.props.dashboardEntityFilters[filterName]}
            onChange={() => this.props.toggleEntityFilter(filterName)}
          /> {this.props.filterToggleLabel}
        </div>
      )
    }
  }
}

export default DashboardFilterToggle
