
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import ReactTable from 'react-table-6'
import { setChallengeTab } from './MetricsData'
import { injectIntl } from 'react-intl'
import WithExportCsv from './WithExportCsv'
const MetricsTable = (props) => {
  const allUsers = Object.values(props.allUsers)
  const constructHeader = () => {
    if (props.currentTab === 'challenge') {
      return setChallengeTab(allUsers)
    }
  }
  const ChallengeReactTable = <ReactTable
    columns={constructHeader()}
    data={props.challenges}
    pageSize={props.rowNumber < 50? props.rowNumber : 50}
  />;
 
  return <>
    {ChallengeReactTable}
  </>;
}

export default WithSortedChallenges(
  WithPagedChallenges(injectIntl(MetricsTable), 'challenges', 'pagedChallenges')
)