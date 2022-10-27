
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import ReactTable from 'react-table-6'
import { setChallengeTab, setProjectTab} from './MetricsData'
import { injectIntl } from 'react-intl'

const MetricsTable = (props) => {
  const allUsers = Object.values(props.allUsers)
  let data;
  const constructHeader = () => {
    if (props.currentTab === 'challenge') {
      data = props.challenges;
      return setChallengeTab(allUsers)
    }
    if (props.currentTab === 'project') {
      data = props.projects;
      return setProjectTab(allUsers)
    }
  }
  const ChallengeReactTable = <ReactTable
    columns={constructHeader()}
    data={data}
    // pageSize={props.rowNumber < 50? props.rowNumber : 50}
    pageSize={50}
  />;
 
  return <>
    {ChallengeReactTable}
  </>;
}

export default WithSortedChallenges(
  WithPagedChallenges(injectIntl(MetricsTable), 'challenges', 'pagedChallenges')
)