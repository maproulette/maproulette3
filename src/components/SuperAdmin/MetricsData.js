import React from 'react'
import { FormattedDate } from 'react-intl'
import AsManageableProject from '../../interactions/Project/AsManageableProject'
const OSM_USER_LINK = `${process.env.REACT_APP_OSM_SERVER}/user/`

// Total Number of Tasks, Number of user engaged in task
const setChallengeTab = () => {
  return [
    {
      id: 'id',
      Header: 'ID',
      maxWidth: 80,
      accessor: challenge => challenge.id,
    },

    {
      id: 'name',
      Header: 'NAME',
      accessor: challenge => {
        return <a href={`/admin/project/${challenge.parent}` +
          `/challenge/${challenge.id}`}> {challenge.name} </a>
      },
    },
    {
      id: 'owner',
      Header: 'OWNER',
      accessor: challenge => challenge.owner,
      maxWidth: 100,
    },
    {
      id: 'numOfTasks',
      Header: 'TASKS REMAINING',
      accessor: challenge => challenge.tasksRemaining,
      maxWidth: 150,
    },
    {
      id: 'tasksCompletionPercentage',
      Header: '% COMPLETED TASKS',
      accessor: challenge => challenge.completionPercentage + '%',
      maxWidth: 180,
    },
    {
      id: 'project',
      Header: 'PROJECT',
      accessor: challenge => {
        return <a href={`/admin/project/${challenge.parent}`}> {challenge.parent} </a>
      },
      maxWidth: 120,
      sortable: false
    },
    {
      id: 'visible',
      Header: 'VISIBLE',
      accessor: challenge => challenge.enabled.toString(),
      maxWidth: 120,
    },
    {
      id: 'archived',
      Header: 'ARCHIVED',
      accessor: challenge => challenge.isArchived.toString(),
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: challenge => {
        return <FormattedDate value={challenge.created} />
      },
      maxWidth: 150,
      sortable: false
    },
    {
      id: 'dateLastModified',
      Header: 'DATE LAST MODIFIED',
      accessor: challenge => {
        return <FormattedDate value={challenge.modified} />
      },
      maxWidth: 180,
      sortable: false
    }
  ]
}

const setProjectTab = (challenges) => {
  return [
    {
      id: 'id',
      Header: 'ID',
      maxWidth: 80,
      accessor: project => project.id
    },

    {
      id: 'name',
      Header: 'NAME',
      accessor: project => {
        return <a href={`/admin/project/${project.id}`}> {project.displayName} </a>
      },
    },
    {
      id: 'owner',
      Header: 'OWNER',
      accessor: project => project.owner,
      maxWidth: 100,
    },
    {
      id: 'numOfChallenge',
      Header: '# OF CHALLENGES',
      accessor: project => {
        const projectManage= AsManageableProject(project)
        return(projectManage.childChallenges(challenges).length)
      },
      maxWidth: 150,
    },
    {
      id: 'visible',
      Header: 'VISIBLE',
      accessor: project => project.enabled.toString(),
      maxWidth: 120,
    },
    {
      id: 'archived',
      Header: 'ARCHIVED',
      accessor: project => project.isArchived.toString(),
      maxWidth: 120,
    },
    {
      id: 'Virtual',
      Header: 'VIRTUAL',
      accessor: project => project.isVirtual.toString(),
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: project => {
        return <FormattedDate value={project.created} />
      },
      maxWidth: 150,
      sortable: false
    },
    {
      id: 'dateLastModified',
      Header: 'DATE LAST MODIFIED',
      accessor: project => {
        return <FormattedDate value={project.modified} />
      },
      maxWidth: 180,
      sortable: false
    }
  ]
}

// number of challenges participated, total task completed, total days active
const setUserTab = () => {
  return [
    {
      id: 'id',
      Header: 'ID',
      maxWidth: 80,
      accessor: user => user.id,
    },
    {
      id: 'name',
      Header: 'NAME',
      accessor: user => user.osmProfile.displayName,
      Cell: cell => <a href={OSM_USER_LINK + cell.value} target='_blank' rel='noreferrer' > {cell.value} </a>,
      maxWidth: 100,
    },
    {
      id: 'score',
      Header: 'SCORE',
      accessor: user => user.score,
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: user => {
        return <FormattedDate {...user.created} />
      },
      maxWidth: 150,
    },
    {
      id: 'lastActive',
      Header: 'DATE LAST ACTIVE',
      accessor: user => {
        return <FormattedDate {...user.modified} />
      },
      maxWidth: 180,
    }
  ]
}

export { setChallengeTab, setProjectTab, setUserTab}
