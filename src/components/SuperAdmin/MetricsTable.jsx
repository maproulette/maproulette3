import { useMemo } from "react";
import { injectIntl } from "react-intl";
import { usePagination, useResizeColumns, useSortBy, useTable } from "react-table";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithSortedChallenges from "../HOCs/WithSortedChallenges/WithSortedChallenges";
import PaginationControl from "../PaginationControl/PaginationControl";
import { renderTableHeader } from "../TableShared/EnhancedTable";
import { CHALLENGE_COLUMNS, PROJECT_COLUMNS, USER_COLUMNS } from "./MetricsData";
import WithMetricsSearchResults from "./WithMetricsSearchResults";
import WithSortedProjects from "./WithSortedProjects";
import WithSortedUsers from "./WithSortedUsers";

const MetricsTable = (props) => {
  // Create a storage key for column widths based on current tab
  const storageKey = `mrColumnWidths-metrics-${props.currentTab || "default"}`;

  // Initialize column widths with storage
  const [columnWidths, saveColumnWidths] = useColumnWidthStorage(storageKey);

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

  // Apply column widths to columns
  const getColumnsWithWidths = (baseColumns) => {
    return baseColumns.map((column) => ({
      ...column,
      width: columnWidths[column.accessor || column.id] || column.width || 150,
      minWidth: column.minWidth || 80,
    }));
  };

  const columns = useMemo(() => {
    if (props.currentTab === "challenges") {
      return getColumnsWithWidths(CHALLENGE_COLUMNS);
    } else if (props.currentTab === "projects") {
      return getColumnsWithWidths(PROJECT_COLUMNS);
    } else if (props.currentTab === "users") {
      return getColumnsWithWidths(USER_COLUMNS);
    }
    return [];
  }, [props.currentTab, columnWidths]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize, columnResizing },
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 50 },
      pageCount: Math.ceil(data.length / 50),
      disableSortRemove: true,
      defaultColumn: {
        minWidth: 80,
      },
      columnResizeMode: "onEnd",
    },
    useSortBy,
    useResizeColumns,
    usePagination,
  );

  // Track resizing state
  const isResizing = useResizingState(columnResizing, headerGroups, columnWidths, saveColumnWidths);

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
        <thead>{renderTableHeader(headerGroups)}</thead>

        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr className="mr-border-y mr-border-white-10" {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      className="mr-px-2 mr-whitespace-nowrap"
                      {...cell.getCellProps()}
                      key={cell.column.id}
                      style={{
                        ...cell.getCellProps().style,
                        maxWidth: cell.column.width,
                        minWidth: cell.column.minWidth,
                        overflow: "hidden",
                      }}
                    >
                      <div className="mr-cell-content">{cell.render("Cell")}</div>
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
