import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { messagesByFilter }
       from '../../../../services/Widget/ProjectFilter/ProjectFilter'
import DashboardFilterToggle
       from '../DashboardFilterToggle/DashboardFilterToggle'

const VisibleFilterToggle = DashboardFilterToggle('project', 'visible')
const OwnerFilterToggle = DashboardFilterToggle('project', 'owner')
const PinnedFilterToggle = DashboardFilterToggle('project', 'pinned')

export default class ProjectFilterGroup extends Component {
  render() {
    return (
      <React.Fragment>
        <PinnedFilterToggle {...this.props}
                            dashboardEntityFilters={this.props.dashboardProjectFilters}
                            toggleEntityFilter={this.props.toggleDashboardProjectFilter}
                            filterToggleLabel={<FormattedMessage {...messagesByFilter.pinned} />} />

        <OwnerFilterToggle {...this.props}
                           dashboardEntityFilters={this.props.dashboardProjectFilters}
                           toggleEntityFilter={this.props.toggleDashboardProjectFilter}
                           filterToggleLabel={<FormattedMessage {...messagesByFilter.owner} />} />

        <VisibleFilterToggle {...this.props}
                             dashboardEntityFilters={this.props.dashboardProjectFilters}
                             toggleEntityFilter={this.props.toggleDashboardProjectFilter}
                             filterToggleLabel={<FormattedMessage {...messagesByFilter.visible} />} />
      </React.Fragment>
    )
  }
}
