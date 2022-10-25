
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import ReactTable from 'react-table-6'
import {setChallengeTab} from './MetricsData'
import { injectIntl} from 'react-intl'
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
      pageSize={50}
    />;

  const ReactButton = <button
    color="primary"
    type="button"
    onClick={() => {
    props.filterData()
}}>
      test
      </button>

  return <>
    {ReactButton}
    {ChallengeReactTable}
  </>;
}

export default WithSortedChallenges(
        WithPagedChallenges(WithExportCsv(injectIntl(MetricsTable)), 'challenges', 'pagedChallenges')
      )