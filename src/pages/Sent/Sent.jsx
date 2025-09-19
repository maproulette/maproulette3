import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { useFilters, useResizeColumns, useSortBy, useTable } from "react-table";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
import SvgSymbol from "../../components/SvgSymbol/SvgSymbol";
import { SearchFilter } from "../../components/TableShared/EnhancedTable";
import {
  cellStyles,
  inputStyles,
  rowStyles,
  tableStyles,
} from "../../components/TableShared/TableStyles";
import CommentType from "../../services/Comment/CommentType";
import { keysByReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import { TaskStatusColors, keysByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import HeaderSent from "./HeaderSent";
import Notification from "./Notification";
import { useSentComments } from "./SentCommentsHooks";

const DEFAULT_SORT_CRITERIA = {
  id: "created",
  desc: true,
};

const DEFAULT_PAGINATION = {
  page: 0,
  pageSize: 25,
};

const Sent = (props) => {
  const [commentType, setCommentType] = useState(CommentType.TASK);
  const comments = useSentComments(commentType);
  const [sortCriteria, setSortCriteria] = useState(DEFAULT_SORT_CRITERIA);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedComment, setSelectedComment] = useState(null);
  const isInitialMount = useRef(true);

  const data = comments.data;

  const getColumns = useCallback(() => {
    const baseTaskColumns = [
      {
        id: "task_id",
        Header: "Task ID",
        accessor: "taskId",
        Cell: ({ value, row }) =>  value ? <Link to={`challenge/${row.original.challengeId}/task/${value}`}>{value}</Link> : null,
        Filter: ({ column: { filterValue, setFilter } }) => (
          <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
            <SearchFilter
              value={filterValue}
              onChange={setFilter}
              placeholder="Search task ID..."
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
        width: 100,
      },
      {
        id: "created",
        Header: "Date",
        accessor: "created",
        Cell: ({ value }) =>
          value ? (
            <div className="mr-whitespace-nowrap">
              <FormattedDate value={value} /> <FormattedTime value={value} />
            </div>
          ) : null,
        width: 180,
      },
      {
        id: "comment",
        Header: "Comment",
        accessor: "comment",
        Cell: ({ value, row }) =>
          value ? (
            <button
              className="mr-text-left mr-text-green-lighter hover:mr-text-green-light mr-underline mr-cursor-pointer"
              onClick={() => setSelectedComment(row.original)}
            >
              {value}
            </button>
          ) : null,
        Filter: ({ column: { filterValue, setFilter } }) => (
          <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
            <SearchFilter
              value={filterValue}
              onChange={setFilter}
              placeholder="Search comment..."
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
        width: 300,
      },
      {
        id: "task_status",
        Header: "Task Status",
        accessor: "taskStatus",
        Cell: ({ value }) => {
          const statusInt = value || 0;
          const statusKey = keysByStatus[statusInt];
          const statusColor = TaskStatusColors[statusInt];
          return (
            <span style={{ color: statusColor }}>
              {statusKey ? statusKey.toUpperCase() : statusInt}
            </span>
          );
        },
        width: 140,
      },
      {
        id: "review_status",
        Header: "Review Status",
        accessor: "reviewStatus",
        Cell: ({ value }) => {
          if (!value) return null;
          const statusKey = keysByReviewStatus[value];
          return <span>{statusKey ? statusKey.toUpperCase() : value}</span>;
        },
        width: 140,
      },
    ];

    const baseChallengeColumns = [
      {
        id: "challenge_name",
        Header: "Challenge",
        accessor: "challengeName",
        Cell: ({ value, row }) => {
          if (!value || !row.original?.challengeId) return null;
          return (
            <Link to={`browse/challenges/${row.original.challengeId}?tab=conversation`}>
              {value}
            </Link>
          );
        },
        Filter: ({ column: { filterValue, setFilter } }) => (
          <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
            <SearchFilter
              value={filterValue}
              onChange={setFilter}
              placeholder="Search challenge..."
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
        width: 200,
      },
      {
        id: "created",
        Header: "Date",
        accessor: "created",
        Cell: ({ value }) =>
          value ? (
            <div className="mr-whitespace-nowrap">
              <FormattedDate value={value} /> <FormattedTime value={value} />
            </div>
          ) : null,
        width: 180,
      },
      {
        id: "comment",
        Header: "Comment",
        accessor: "comment",
        Cell: ({ value, row }) => {
          if (!value) return null;
          return (
            <button
              className="mr-text-left mr-text-green-lighter hover:mr-text-green-light mr-underline mr-cursor-pointer"
              onClick={() => setSelectedComment(row.original)}
            >
              {value}
            </button>
          );
        },
        Filter: ({ column: { filterValue, setFilter } }) => (
          <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
            <SearchFilter
              value={filterValue}
              onChange={setFilter}
              placeholder="Search comment..."
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
        width: 400,
      },
    ];

    return commentType === CommentType.TASK ? baseTaskColumns : baseChallengeColumns;
  }, [commentType]);

  const columns = useMemo(() => getColumns(), [getColumns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows: filteredRows,
    prepareRow,
    state: { sortBy, filters },
    setAllFilters,
  } = useTable(
    {
      data,
      columns,
      manualSortBy: true,
      disableSortRemove: true,
      disableMultiSort: true,
      defaultColumn: {
        Filter: () => null,
        minWidth: 30,
      },
      initialState: {
        sortBy: [sortCriteria],
      },
      columnResizeMode: "onEnd",
      autoResetFilters: false,
      autoResetSortBy: false,
    },
    useFilters,
    useSortBy,
    useResizeColumns,
  );

  const clearFilters = () => {
    setAllFilters([]);
  };

  useEffect(() => {
    comments.fetch(props.user?.id, sortCriteria, pagination, debouncedSearchTerm);
  }, [
    props.user?.id,
    commentType,
    sortCriteria.id,
    sortCriteria.desc,
    pagination.page,
    pagination.pageSize,
    debouncedSearchTerm,
  ]);

  useEffect(() => {
    if (sortBy && sortBy[0]) setSortCriteria(sortBy[0]);
  }, [sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Reset to page 1 whenever filters change (but not on initial mount)
    setPagination((prev) => ({ ...prev, page: 0 }));
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const resetTable = () => {
    setSortCriteria(DEFAULT_SORT_CRITERIA);
    setPagination(DEFAULT_PAGINATION);
  };

  // Function to close the notification modal
  const closeNotification = () => {
    setSelectedComment(null);
  };

  const messages = {
    clearFiltersLabel: {
      id: "Sent.clearFilters.label",
      defaultMessage: "Clear Filters",
    },
  };

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-flex-col mr-justify-center mr-items-center">
      <section className="mr-flex-grow mr-w-full mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded">
        <HeaderSent
          commentType={commentType}
          refreshData={() => comments.fetch(props.user?.id, sortCriteria, pagination, searchTerm)}
          setCommentType={(t) => {
            setCommentType(t);
            resetTable();
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {filters.length > 0 && (
          <div className="mr-flex mr-justify-end mr-mb-4">
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
          </div>
        )}
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
              {filteredRows.map((row, rowIndex) => {
                prepareRow(row);
                return (
                  <tr className={rowStyles} {...row.getRowProps()} key={`row-${row.original.id || row.id}-${rowIndex}`}>
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={`cell-${row.original.id || row.id}-${cell.column.id}-${cellIndex}`}
                        className={cellStyles}
                        {...cell.getCellProps()}
                        style={{
                          ...cell.getCellProps().style,
                          width: cell.column.width,
                          minWidth: cell.column.minWidth,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          height: "40px",
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
          currentPage={pagination.page}
          pageCount={Math.ceil(
            (filters.length > 0 ? filteredRows.length : comments.count || 0) / pagination.pageSize,
          )}
          pageSize={pagination.pageSize}
          gotoPage={(page) => setPagination({ ...pagination, page })}
          setPageSize={(pageSize) => setPagination({ ...pagination, pageSize, page: 0 })}
          previousPage={() =>
            setPagination((prev) => ({
              ...prev,
              page: Math.max(0, prev.page - 1),
            }))
          }
          nextPage={() =>
            setPagination((prev) => {
              const totalCount = filters.length > 0 ? filteredRows.length : comments.count || 0;
              const maxPage = Math.ceil(totalCount / prev.pageSize) - 1;
              return {
                ...prev,
                page: Math.min(maxPage, prev.page + 1),
              };
            })
          }
        />

        {selectedComment && (
          <Notification
            id={
              commentType === CommentType.TASK
                ? selectedComment.taskId
                : selectedComment.challengeId
            }
            text={selectedComment.comment}
            type={commentType}
            onClose={closeNotification}
          />
        )}
      </section>
    </div>
  );
};

export default injectIntl(WithCurrentUser(Sent));
