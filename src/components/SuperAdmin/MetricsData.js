import React from "react";
import { FormattedDate } from 'react-intl'
import AsManageableProject from "../../interactions/Project/AsManageableProject";
const OSM_USER_LINK = `${process.env.REACT_APP_OSM_SERVER}/user/`;

// Total Number of Tasks, Number of user engaged in task
const setChallengeTab = (allUsers) => {
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
        return <a href={`/admin/project/${challenge.parent.id}` +
          `/challenge/${challenge.id}`}> {challenge.name} </a>
      },
    },
    {
      id: 'owner',
      Header: 'OWNER',
      accessor: challenge => {
        if (allUsers?.length) {
          return allUsers.find(user =>
            user.osmProfile.id == challenge.owner
          )?.osmProfile?.displayName
        }
        return challenge?.owner
      },
      Cell: cell => <a href={OSM_USER_LINK + cell.value} target='_blank' rel='noreferrer' > {cell.value} </a>,
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
      maxWidth: 120,
    },
    {
      id: 'isArchived',
      Header: 'IS ARCHIVED',
      accessor: challenge => challenge.isArchived.toString(),
      maxWidth: 120,
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

// Total Number of Challenges, Number of user engaged project
const setProjectTab = (allUsers, challenges) => {
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
      accessor: project => {
        return allUsers.find(user =>
          user.osmProfile.id == project.owner
        ).osmProfile.displayName
      },
      Cell: cell => <a href={OSM_USER_LINK + cell.value} target='_blank' rel='noreferrer' > {cell.value} </a>,
      maxWidth: 100,
    },
    {
      id: 'numOfChallenge',
      Header: '# OF CHALLENGES',
      accessor: project => {
        const projectManage= AsManageableProject(project)
        return(projectManage.childChallenges(challenges).length)
      },
      Cell: cell => <a href={OSM_USER_LINK + cell.value} target='_blank' rel='noreferrer' > {cell.value} </a>,
      maxWidth: 150,
    },

    {
      id: 'isArchived',
      Header: 'IS ARCHIVED',
      accessor: project => project.isArchived.toString(),
      maxWidth: 120,
    },
    {
      id: 'isVirtual',
      Header: 'IS VIRTUAL',
      accessor: project => project.isVirtual.toString(),
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: project => {
        return <FormattedDate {...project.created} />
      },
      maxWidth: 150,
    },
    {
      id: 'dateLastModified',
      Header: 'DATE LAST MODIFIED',
      accessor: project => {
        return <FormattedDate {...project.modified} />
      },
      maxWidth: 180,
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
