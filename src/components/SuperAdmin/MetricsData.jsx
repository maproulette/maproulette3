import { FormattedDate } from 'react-intl'
import SuperUserToggle from './SuperUserToggle'

const OSM_USER_LINK = `${import.meta.env.REACT_APP_OSM_SERVER}/user/`

const setChallengeTab = () => {
  return [
    {
      id: 'id',
      Header: 'ID',
      maxWidth: 80,
      accessor: (challenge) => challenge.id,
    },
    {
      id: 'name',
      Header: 'NAME',
      accessor: (challenge) => challenge.name,
      Cell: (props) => {
        if (props.value) {
          return (
            <a
              href={
                `/admin/project/${props.original?.parent?.id}` +
                `/challenge/${props.original.id}`
              }
              target='_blank'
              rel='noopener noreferrer'
            >
              {props.value}
            </a>
          )
        }

        return null
      },
      maxWidth: 180,
      sortable: true,
    },
    {
      id: 'owner',
      Header: 'OWNER',
      accessor: (challenge) => challenge.owner,
    },
    {
      id: 'numOfTasks',
      Header: 'TASKS REMAINING',
      accessor: (challenge) => challenge.tasksRemaining,
      maxWidth: 150,
    },
    {
      id: 'tasksCompletionPercentage',
      Header: '% COMPLETED TASKS',
      accessor: (challenge) => {
        return challenge.completionPercentage
      },
      sortable: true,
      maxWidth: 180,
      Cell: (props) => <div>{props.value}%</div>,
    },
    {
      id: 'project',
      Header: 'PROJECT',
      accessor: (challenge) => challenge.parent?.displayName,
      maxWidth: 120,
      sortable: true,
      Cell: (props) => {
        if (props.value) {
          return (
            <a
              href={`/admin/project/${props.original?.parent?.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {props.value}
            </a>
          )
        }
        return null
      },
    },
    {
      id: 'discoverable',
      Header: 'DISCOVERABLE',
      accessor: (challenge) => challenge.enabled.toString(),
      maxWidth: 150,
    },
    {
      id: 'archived',
      Header: 'ARCHIVED',
      accessor: (challenge) => challenge.isArchived.toString(),
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: (challenge) => {
        return challenge.created
      },
      maxWidth: 150,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
    {
      id: 'dataOriginDate',
      Header: 'DATA ORIGIN DATE',
      accessor: (challenge) => challenge.dataOriginDate,
      maxWidth: 180,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
    {
      id: 'lastTaskRefreshDate',
      Header: 'LAST TASK REFRESH',
      accessor: (challenge) => challenge.lastTaskRefresh,
      maxWidth: 180,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
  ]
}

const setProjectTab = () => {
  return [
    {
      id: 'id',
      Header: 'ID',
      maxWidth: 80,
      accessor: (project) => project.id,
    },
    {
      id: 'name',
      Header: 'NAME',
      accessor: (project) => project.displayName,
      Cell: (props) => {
        if (props.value) {
          return (
            <a
              href={`/admin/project/${props.original.id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {props.value}
            </a>
          )
        }
        return null
      },
      sortable: true,
      maxWidth: 180,
    },
    {
      id: 'owner',
      Header: 'OWNER',
      accessor: (project) => project.owner,
      maxWidth: 120,
    },
    {
      id: 'discoverable',
      Header: 'DISCOVERABLE',
      accessor: (project) => project.enabled.toString(),
      maxWidth: 150,
    },
    {
      id: 'archived',
      Header: 'ARCHIVED',
      accessor: (project) => project.isArchived.toString(),
      maxWidth: 120,
    },
    {
      id: 'Virtual',
      Header: 'VIRTUAL',
      accessor: (project) => project.isVirtual.toString(),
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: (project) => {
        return project.created
      },
      maxWidth: 150,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
    {
      id: 'dateLastModified',
      Header: 'DATE LAST MODIFIED',
      accessor: (project) => {
        return project.modified
      },
      maxWidth: 150,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
  ]
}

const setUserTab = (userChanges, setUserChanges) => {
  return [
    {
      id: 'id',
      Header: 'ID',
      maxWidth: 80,
      accessor: (user) => user.id,
    },
    {
      id: 'name',
      Header: 'NAME',
      accessor: (user) => user.displayName,
      Cell: (cell) => (
        <a
          href={OSM_USER_LINK + cell.value}
          target='_blank'
          rel='noopener noreferrer'
        >
          {cell.value}
        </a>
      ),
      sortable: true,
      maxWidth: 180,
    },
    {
      id: 'score',
      Header: 'SCORE',
      accessor: (user) => user.score,
      maxWidth: 120,
    },
    {
      id: 'dateCreated',
      Header: 'DATE CREATED',
      accessor: (user) => {
        return user.created
      },
      maxWidth: 150,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
    {
      id: 'lastActive',
      Header: 'DATE LAST ACTIVE',
      accessor: (user) => {
        return user.modified
      },
      maxWidth: 150,
      sortable: true,
      Cell: (props) =>
        !props.value ? null : (
          <span>
            <FormattedDate value={props.value} />
          </span>
        ),
    },
    {
      id: 'superUser',
      Header: 'ROLE',
      accessor: (user) => {
        return user.superUser
      },
      maxWidth: 200,
      sortable: true,
      Cell: (props) => {
        return (
          <SuperUserToggle
            initialValue={props.value}
            userId={props?.original?.id}
            userChanges={userChanges}
            setUserChanges={setUserChanges}
          />
        )
      }
    },
  ]
}

export { setChallengeTab, setProjectTab, setUserTab }
