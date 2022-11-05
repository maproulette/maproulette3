
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults';
import ReactTable from 'react-table-6'
import { setChallengeTab} from './MetricsData'
import { injectIntl } from 'react-intl'

const MetricsTable = (props) => {
  let data
  const constructHeader = () => {
    if (props.currentTab === 'challenge') {
      data = props.challenges
      return setChallengeTab()
    }
    else if (props.currentTab === 'project') {
      return null
    }
    else if (props.currentTab === 'user') {
      return null
    }
  }

  return (
    <ReactTable
      columns={constructHeader()}
      data={data}
      defaultPageSize={50}
    />
  )
}

export default  WithSearchResults(WithSortedChallenges(
  WithPagedChallenges(injectIntl(MetricsTable), 'challenges', 'pagedChallenges')
), 'challenges', 'challenges')
