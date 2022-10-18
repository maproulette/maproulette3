
import React from 'react'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import ReactTable from 'react-table-6'
import { useEffect } from 'react'
import { FormattedDate } from 'react-intl'
import WithFilteredChallenges from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults'
const challengesData = (props) => {

  const allUsers = Object.values(props.allUsers)

  useEffect(() => {
  }, [props])
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
        Header: '# OF TASKS',
        accessor: challenge => challenge.tasksRemaining,
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
  console.log(props)
  return <ReactTable
    columns={constructHeader()}
    data={props.challenges}
    pageSize={50}
  />;
}

export default WithCurrentUser(WithFilteredChallenges(WithSearchResults(WithChallenges(challengesData))))