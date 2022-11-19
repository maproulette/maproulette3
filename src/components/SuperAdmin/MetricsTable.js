
import React from 'react'
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges'
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults'
import WithSortedProjects from './WithSortedProjects'
import ReactTable from 'react-table-6'
import { setChallengeTab, setProjectTab } from './MetricsData'
import { injectIntl } from 'react-intl'
import BusySpinner from '../BusySpinner/BusySpinner'

const MetricsTable = (props) => {
  let data
  const constructHeader = () => {
    if (props.currentTab === 'challenges') {
      data = props.challenges
      return setChallengeTab()
    }
    else if (props.currentTab === 'projects') {
      data = props.projects
      return setProjectTab(props.challenges)
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


// WithSearchResults for search box
// WithSortedChallenges for sort by
export default WithSearchResults(WithSortedProjects(WithSortedChallenges(
  injectIntl(MetricsTable), 'challenges', null, { frontendSearch: true }
), 'projects', null), 'challenges', 'challenges')
