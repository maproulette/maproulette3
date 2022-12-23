
import React from 'react'
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges'
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults'
import WithSortedProjects from './WithSortedProjects'
import WithSortedUsers from './WithSortedUsers'
import ReactTable from 'react-table-6'
import { setChallengeTab, setProjectTab, setUserTab} from './MetricsData'
import { injectIntl } from 'react-intl'
import BusySpinner from '../BusySpinner/BusySpinner'

const MetricsTable = (props) => {
  let data
  const constructHeader = () => {
    if (props.currentTab === 'challenges') {
      data = props.challenges.map(c => ({
        id: c.id,
        name: c.name,
        parent: c.parent,
        owner: c.owner,
        tasksRemaining: c.tasksRemaining,
        completionPercentage: c.completionPercentage,
        enabled: c.enabled,
        isArchived: c.isArchived,
        created: c.created,
        dataOriginDate: c.dataOriginDate,
        lastTaskRefresh: c.lastTaskRefresh
      }))
      return setChallengeTab(props)
    }
    else if (props.currentTab === 'projects') {
      data = props.projects.map(p => ({
        id: p.id,
        displayName: p.displayName,
        owner: p.owner,
        enabled: p.enabled,
        isArchived: p.isArchived,
        isVirtual: p.isVirtual,
        created: p.created,
        modified: p.modified
      }))
      return setProjectTab(props)
    }
    else if (props.currentTab === 'users') {
      data = props.users.map(u => ({
        id: u.id,
        displayName: u.osmProfile.displayName,
        score: u.score,
        created: u.created,
        modified: u.modified,
      }))
      return setUserTab()
    }
  }
  return !props.isloadingCompleted ? (
    <div className='admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue'>
      <BusySpinner />
    </div>
  ) : (
    <ReactTable
      columns={constructHeader()}
      data={data}
      defaultPageSize={50}
    />
  )
}

export default WithSearchResults(WithSortedUsers(WithSortedProjects(WithSortedChallenges(
  injectIntl(MetricsTable), 'challenges', null, { frontendSearch: true }
), 'projects', null), 'users', null), 'challenges', 'challenges')
