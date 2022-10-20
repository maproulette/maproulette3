
import React from 'react'
import WithPagedChallenges from "../HOCs/WithPagedChallenges/WithPagedChallenges";
import WithSortedChallenges from '../HOCs/WithSortedChallenges/WithSortedChallenges';
import ReactTable from 'react-table-6'
import { useEffect } from 'react'
import { FormattedDate, injectIntl} from 'react-intl'
const challengesData = (props) => {

  const allUsers = Object.values(props.allUsers)
  const constructHeader = () => {
    return [
      {
        id: 'id',
        Header: 'ID',
        maxWidth: 120,
        accessor: challenge => challenge.id,
      },

      {
        id: 'name',
        Header: 'NAME',
        accessor: challenge => {
          return <a href={`/admin/project/${challenge.parent.id}` +
            `/challenge/${challenge.id}`}> {challenge.name} </a>
        },
      },
      {
        id: 'owner',
        Header: 'OWNER',
        accessor: challenge => {
          return allUsers.find(user =>
            user.osmProfile.id == challenge.owner
          ).osmProfile.displayName
        },
        Cell: cell => <a href={'https://www.openstreetmap.org/user/' + cell.value} target='_blank' rel='noreferrer' > {cell.value} </a>,
        maxWidth: 150,
      },
      {
        id: 'numOfTasks',
        Header: '# OF TASKS Remaining',
        accessor: challenge => challenge.tasksRemaining,
        maxWidth: 200,
      },
      {
        id: 'tasksCompletionPercentage',
        Header: '% Complete Tasks',
        accessor: challenge => challenge.completionPercentage + '%',
        maxWidth: 150,
      },
      {
        id: 'project',
        Header: 'PROJECT',
        accessor: challenge => {
          return <a href={`/admin/project/${challenge.parent.id}`}> {challenge.parent.displayName} </a>
        },
      },
      {
        id: 'isArchived',
        Header: 'IS ARCHIVED',
        accessor: challenge => challenge.isArchived.toString(),
        maxWidth: 150,
      },
      {
        id: 'dateCreated',
        Header: 'DATE CREATED',
        accessor: challenge => {
          return <FormattedDate {...challenge.created} />
        },
        maxWidth: 150,
      },
      {
        id: 'dateLastModified',
        Header: 'DATE LAST MODIFIED',
        accessor: challenge => {
          return <FormattedDate {...challenge.modified} />
        },
        maxWidth: 180,
      }
    ];
  };
 
  return <ReactTable
    columns={constructHeader()}
    data={props.challenges}
    pageSize={50}
  />;
}

export default WithSortedChallenges(
        WithPagedChallenges(injectIntl(challengesData), 'challenges', 'pagedChallenges')
      )