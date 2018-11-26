import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { messagesByFilter }
       from '../../../../services/Widget/ChallengeFilter/ChallengeFilter'
import DashboardFilterToggle
       from '../DashboardFilterToggle/DashboardFilterToggle'

const VisibleFilterToggle = DashboardFilterToggle('challenge', 'visible')
const PinnedFilterToggle = DashboardFilterToggle('challenge', 'pinned')

export default class ChallengeFilterGroup extends Component {
  render() {
    return (
      <React.Fragment>
        <VisibleFilterToggle {...this.props}
                             dashboardEntityFilters={this.props.dashboardChallengeFilters}
                             toggleEntityFilter={this.props.toggleDashboardChallengeFilter}
                             filterToggleLabel={<FormattedMessage {...messagesByFilter.visible} />} />
        <PinnedFilterToggle {...this.props}
                            dashboardEntityFilters={this.props.dashboardChallengeFilters}
                            toggleEntityFilter={this.props.toggleDashboardChallengeFilter}
                            filterToggleLabel={<FormattedMessage {...messagesByFilter.pinned} />} />
      </React.Fragment>
    )
  }
}
