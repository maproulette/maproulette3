
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults';
import ReactTable from 'react-table-6'
import { setChallengeTab} from './MetricsData'
import { injectIntl } from 'react-intl'
import BusySpinner from '../BusySpinner/BusySpinner';

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
  return props.loading ? (
    <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
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

export default  WithSearchResults(WithSortedChallenges(
  WithPagedChallenges(injectIntl(MetricsTable), 'challenges', 'pagedChallenges')
), 'challenges', 'challenges')
