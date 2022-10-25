import React from "react";
import { FormattedDate } from 'react-intl'

const setChallengeTab = (allUsers) => {
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
  ]
}
const setProjectTab = () => {
  return null
}
const setUserTab = () => {
  return null
}

export { setChallengeTab, setProjectTab, setUserTab}
