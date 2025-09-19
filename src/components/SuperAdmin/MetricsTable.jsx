import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { useFilters, usePagination, useResizeColumns, useSortBy, useTable } from "react-table";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithSortedChallenges from "../HOCs/WithSortedChallenges/WithSortedChallenges";
import PaginationControl from "../PaginationControl/PaginationControl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import { SearchFilter } from "../TableShared/EnhancedTable";
import { cellStyles, inputStyles, rowStyles, tableStyles } from "../TableShared/TableStyles";
import { CHALLENGE_COLUMNS, PROJECT_COLUMNS, getUserColumns } from "./MetricsData";
import WithMetricsSearchResults from "./WithMetricsSearchResults";
import WithSortedProjects from "./WithSortedProjects";
import WithSortedUsers from "./WithSortedUsers";

const messages = {
  clearFiltersLabel: {
    id: "MetricsTable.clearFilters.label",
    defaultMessage: "Clear Filters",
  },
};

const MetricsTable = (props) => {
  const [userChanges, setUserChanges] = useState({});
  const isInitialMount = useRef(true);

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
    let baseColumns = [];

    if (props.currentTab === "challenges") {
      baseColumns = CHALLENGE_COLUMNS;
    } else if (props.currentTab === "projects") {
      baseColumns = PROJECT_COLUMNS;
    } else if (props.currentTab === "users") {
      baseColumns = getUserColumns(userChanges, setUserChanges);
    }

    // Add filtering to text columns
    return baseColumns.map((column) => {
      const isTextColumn =
        column.accessor === "name" ||
        column.accessor === "displayName" ||
        column.accessor === "owner" ||
        column.accessor === "parent.displayName";

      if (isTextColumn) {
        return {
          ...column,
          Filter: ({ column: { filterValue, setFilter } }) => (
            <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
              <SearchFilter
                value={filterValue}
                onChange={setFilter}
                placeholder={`Search ${column.Header.toLowerCase()}...`}
                inputClassName={inputStyles}
              />
              {filterValue && (
                <button
                  className="mr-text-white hover:mr-text-green-lighter mr-transition-colors"
                  onClick={() => setFilter(null)}
                >
                  <SvgSymbol
                    sym="icon-close"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-2.5 mr-h-2.5 mr-ml-2"
                  />
                </button>
              )}
            </div>
          ),
        };
      }

      return {
        ...column,
        disableFilters: !isTextColumn,
      };
    });
  }, [props.currentTab, userChanges]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { pageIndex, pageSize, filters },
    gotoPage,
    setPageSize,
    previousPage,
    nextPage,
    setAllFilters,
    rows: filteredRows,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 50 },
      disableSortRemove: true,
      defaultColumn: {
        Filter: () => null,
        minWidth: 80,
      },
      columnResizeMode: "onEnd",
      autoResetFilters: false,
      autoResetSortBy: false,
    },
    useFilters,
    useSortBy,
    useResizeColumns,
    usePagination,
  );

  const clearFilters = () => {
    setAllFilters([]);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Reset to page 1 whenever filters change (but not on initial mount)
    gotoPage(0);
  }, [filters, gotoPage]);

  if (!props.isloadingCompleted) {
    return (
      <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        <BusySpinner />
      </div>
    );
  }

  return (
    <Fragment>
      <section>
        <div className="mr-flex mr-justify-end mr-mb-4">
          <div className="mr-flex mr-items-center mr-space-x-4">
            {filters.length > 0 && (
              <button
                className="mr-flex mr-items-center mr-text-green-lighter mr-leading-loose hover:mr-text-white mr-transition-colors"
                onClick={clearFilters}
              >
                <SvgSymbol
                  sym="close-icon"
                  viewBox="0 0 20 20"
                  className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1"
                />
                <FormattedMessage {...messages.clearFiltersLabel} />
              </button>
            )}
          </div>
        </div>

        <div className="mr-overflow-x-auto">
          <table className={tableStyles} {...getTableProps()} style={{ minWidth: "max-content" }}>
            <thead>
              {headerGroups.map((headerGroup, headerGroupIndex) => (
                <Fragment key={`header-group-${headerGroupIndex}`}>
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column, columnIndex) => (
                      <th
                        {...column.getHeaderProps()}
                        className={`mr-px-2 mr-text-left mr-border-gray-600 mr-relative ${
                          column.canResize ? "mr-border-r mr-border-gray-500" : ""
                        }`}
                        key={`header-${column.id}-${columnIndex}`}
                        style={{
                          ...column.getHeaderProps().style,
                          width: column.width,
                          minWidth: column.minWidth,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="mr-relative mr-overflow-hidden"
                          style={{ paddingRight: !column.disableSortBy ? "24px" : "8px" }}
                        >
                          <div className="mr-truncate">{column.render("Header")}</div>
                          {!column.disableSortBy && (
                            <button
                              className="mr-absolute mr-right-0 mr-top-0 mr-bottom-0 mr-w-6 mr-h-full mr-flex mr-items-center mr-justify-center mr-text-gray-400 hover:mr-text-white mr-cursor-pointer mr-text-xs mr-z-20"
                              {...column.getSortByToggleProps()}
                              title={`Sort by ${column.Header || column.id}`}
                            >
                              {column.isSorted ? (column.isSortedDesc ? "▼" : "▲") : "↕"}
                            </button>
                          )}
                        </div>
                        {column.canResize && (
                          <div
                            {...column.getResizerProps()}
                            className="mr-absolute mr-right-0 mr-top-0 mr-w-1 mr-h-full mr-bg-gray-400 mr-cursor-col-resize hover:mr-bg-blue-400 hover:mr-scale-x-3 mr-transition-all mr-z-10"
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {headerGroup.headers.map((column, columnIndex) => (
                      <th
                        key={`filter-${column.id}-${columnIndex}`}
                        className="mr-px-2"
                        style={{
                          width: column.width,
                          minWidth: column.minWidth,
                        }}
                      >
                        <div>{column.Filter ? column.render("Filter") : null}</div>
                      </th>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row, rowIndex) => {
                prepareRow(row);
                return (
                  <tr
                    className={rowStyles}
                    {...row.getRowProps()}
                    key={`row-${row.original.id}-${rowIndex}`}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`cell-${row.original.id}-${cell.column.id}-${cellIndex}`}
                        {...cell.getCellProps()}
                        className={cellStyles}
                        style={{
                          ...cell.getCellProps().style,
                          width: cell.column.width,
                          minWidth: cell.column.minWidth,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div className="mr-cell-content">{cell.render("Cell")}</div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PaginationControl
          currentPage={pageIndex}
          pageCount={Math.ceil(filteredRows.length / pageSize)}
          pageSize={pageSize}
          gotoPage={gotoPage}
          setPageSize={setPageSize}
          previousPage={previousPage}
          nextPage={nextPage}
        />
      </section>
    </Fragment>
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
