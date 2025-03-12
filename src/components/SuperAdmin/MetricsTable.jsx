import { useMemo } from "react";
import { injectIntl } from "react-intl";
import { useTable, usePagination, useSortBy } from "react-table";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithSortedChallenges from "../HOCs/WithSortedChallenges/WithSortedChallenges";
import { CHALLENGE_COLUMNS, PROJECT_COLUMNS, USER_COLUMNS } from "./MetricsData";
import WithMetricsSearchResults from "./WithMetricsSearchResults";
import WithSortedProjects from "./WithSortedProjects";
import WithSortedUsers from "./WithSortedUsers";
import PaginationControl from "../PaginationControl/PaginationControl";
const MetricsTable = (props) => {
  const data = useMemo(() => {
    if (props.currentTab === "challenges") {
      return props.challenges.map((c) => ({
        id: c.id,
        name: c.name,
        parent: c.parent,
        owner: c.owner,
        tasksRemaining: c.tasksRemaining,
        completionPercentage: c.completionPercentage,
        enabled: c.enabled,
        isArchived: c.isArchived,
        created: c.created,
        dataOriginDate: c.dataOriginDate,
        lastTaskRefresh: c.lastTaskRefresh,
      }));
    } else if (props.currentTab === "projects") {
      return props.projects.map((p) => ({
        id: p.id,
        displayName: p.displayName,
        owner: p.owner,
        enabled: p.enabled,
        isArchived: p.isArchived,
        isVirtual: p.isVirtual,
        created: p.created,
        modified: p.modified,
      }));
    } else if (props.currentTab === "users") {
      return props.users.map((u) => ({
        id: u.id,
        displayName: u.osmProfile.displayName,
        score: u.score,
        created: u.created,
        modified: u.modified,
        superUser: Boolean(u.grants?.find((grant) => grant.role === -1)),
      }));
    } else { 
      return [];
    }
  }, [props.currentTab, props.challenges, props.projects, props.users]);

  const columns = useMemo(() => {
    if (props.currentTab === "challenges") {
      return CHALLENGE_COLUMNS;
    } else if (props.currentTab === "projects") {
      return PROJECT_COLUMNS;
    } else if (props.currentTab === "users") {
      return USER_COLUMNS;
    }
    return [];
  }, [props.currentTab]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize },
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 50 },
      pageCount: Math.ceil(data.length / 50),
    },
    useSortBy,
    usePagination
  );

  if (!props.isloadingCompleted) {
    return (
      <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div>
    );
  }

  return (
    <section>
      <table className="mr-w-full mr-text-white mr-links-green-lighter" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="mr-text-left mr-px-2 mr-whitespace-nowrap"
                >
                  {column.render("Header")}
                  {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr className="mr-border-y mr-border-white-10" {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td className="mr-px-2 mr-whitespace-nowrap" {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <PaginationControl
          currentPage={pageIndex}
          totalPages={Math.ceil(data.length / pageSize)}
          pageSize={pageSize}
          gotoPage={gotoPage}
          setPageSize={setPageSize}
        />
    </section>
  );
};

export default WithMetricsSearchResults(
  WithSortedUsers(
    WithSortedProjects(
      WithSortedChallenges(injectIntl(MetricsTable), "challenges", null, {
        frontendSearch: true,
      }),
      "projects",
      null,
    ),
    "users",
    null,
  ),
  "challenges",
  "challenges",
);
