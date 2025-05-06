import { FormattedDate } from "react-intl";

const OSM_USER_LINK = `${window.env.REACT_APP_OSM_SERVER}/user/`;

export const CHALLENGE_COLUMNS = [
  {
    Header: "ID",
    accessor: "id",
    width: 80,
  },
  {
    Header: "Name",
    accessor: "name",
    width: 180,
    Cell: ({ row, value }) =>
      value ? (
        <a
          href={`/admin/project/${row.original?.parent?.id}/challenge/${row.original.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : null,
  },
  {
    Header: "Owner",
    accessor: "owner",
  },
  {
    Header: "Remaining",
    accessor: "tasksRemaining",
    width: 150,
  },
  {
    Header: "Completion",
    accessor: "completionPercentage",
    width: 180,
    Cell: ({ value }) => <div>{value}%</div>,
  },
  {
    Header: "Project",
    accessor: "parent.displayName",
    width: 120,
    Cell: ({ row, value }) =>
      value ? (
        <a
          href={`/admin/project/${row.original?.parent?.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value}
        </a>
      ) : null,
  },
  {
    Header: "Discoverable",
    accessor: (row) => row.enabled.toString(),
    width: 150,
  },
  {
    Header: "Archived",
    accessor: (row) => row.isArchived.toString(),
    width: 120,
  },
  {
    Header: "Created",
    accessor: "created",
    width: 150,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
  {
    Header: "Sourced",
    accessor: "dataOriginDate",
    width: 180,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
  {
    Header: "Refreshed",
    accessor: "lastTaskRefresh",
    width: 180,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
];

export const PROJECT_COLUMNS = [
  {
    Header: "Id",
    accessor: "id",
    width: 80,
  },
  {
    Header: "Name",
    accessor: "displayName",
    width: 180,
    Cell: ({ row, value }) =>
      value ? (
        <a href={`/admin/project/${row.original.id}`} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : null,
  },
  {
    Header: "Owner",
    accessor: "owner",
    width: 120,
  },
  {
    Header: "Discoverable",
    accessor: (row) => row.enabled.toString(),
    width: 150,
  },
  {
    Header: "Archived",
    accessor: (row) => row.isArchived.toString(),
    width: 120,
  },
  {
    Header: "Virtual",
    accessor: (row) => row.isVirtual.toString(),
    width: 120,
  },
  {
    Header: "Date Created",
    accessor: "created",
    width: 150,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
  {
    Header: "Date Last Modified",
    accessor: "modified",
    width: 150,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
];

export const USER_COLUMNS = [
  {
    Header: "Id",
    accessor: "id",
    width: 80,
  },
  {
    Header: "Name",
    accessor: "displayName",
    width: 180,
    Cell: ({ value }) => (
      <a href={OSM_USER_LINK + value} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
    ),
  },
  {
    Header: "Score",
    accessor: "score",
    width: 120,
  },
  {
    Header: "Date Created",
    accessor: "created",
    width: 150,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
  {
    Header: "Date Last Active",
    accessor: "modified",
    width: 150,
    Cell: ({ value }) =>
      value ? (
        <span>
          <FormattedDate value={value} />
        </span>
      ) : null,
  },
  {
    Header: "Role",
    accessor: "superUser",
    width: 200,
    Cell: ({ value }) => <div>{value ? "Super User" : "Basic User"}</div>,
  },
];
