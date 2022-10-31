
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults';
import ReactTable from 'react-table-6'
import { setChallengeTab, setProjectTab, setUserTab} from './MetricsData'
import { injectIntl } from 'react-intl'

const MetricsTable = (props) => {
  const allUsers = Object.values(props.allUsers)
  let data
  const constructHeader = () => {
    console.log(props.currentTab)
    if (props.currentTab === 'challenge') {
      data = props.challenges
      return setChallengeTab(allUsers)
    }
    else if (props.currentTab === 'project') {
      data = props.projects
      return setProjectTab(allUsers, props.challenges)
    }
    else if (props.currentTab === 'user') {
      data = allUsers
      return setUserTab() 
    }
  }

  return (
    <ReactTable
      columns={constructHeader()}
      data={data}
      pageSize={50}
    />
  )
}

export default  WithSearchResults(WithSortedChallenges(
  WithPagedChallenges(injectIntl(MetricsTable), 'challenges', 'pagedChallenges')
), 'challenges', 'challenges')
