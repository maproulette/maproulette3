
import React from 'react'
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import ReactTable from 'react-table-6'
import { useEffect } from 'react'
import { FormattedDate } from 'react-intl'
const challengesData = (props) => {

  const allUsers = Object.values(props.allUsers)

  useEffect(() => {
  }, [props])
  const constructHeader = () => {
    return [
      {
        id: 'id',
        Header: "ID",
        accessor: task => task.id,
        maxWidth: 120,
      },

      {
        id: 'name',
        Header: "NAME",
        accessor: task => task.name,
      },
      {
        id: 'owner',
        Header: "OWNER",
        accessor: task => {
          return allUsers.find(user =>
            user.osmProfile.id == task.owner
          ).osmProfile.displayName
        },
        maxWidth: 150,
      },
      {
        id: 'dateCreated',
        Header: "DATE CREATED",
        accessor: task => {
          return <FormattedDate {...task.created} />
        },
        maxWidth: 150,
      },
      {
        id: "dateLastModified",
        Header: "DATE LAST MODIFIED",
        accessor: task => {
          return <FormattedDate {...task.modified} />
        },
        maxWidth: 180,
      },
      {
        id: "numOfTasks",
        Header: "# OF TASKS",
        accessor: task => task.tasksRemaining,
        maxWidth: 150,
      },
      {
        id: "isArchived",
        Header: "IS ARCHIVED",
        accessor: task => task.isArchived.toString(),
        maxWidth: 150,
      }
    ];
  };
  return <ReactTable
    className="mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse"
    columns={constructHeader()}
    data={props.challenges}
  // pageSize={2} 
  // pages={2}
  />;
}

export default WithCurrentUser(WithChallenges(challengesData))