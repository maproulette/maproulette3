import { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedDate, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { usePagination, useResizeColumns, useSortBy, useTable } from "react-table";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
import CommentType from "../../services/Comment/CommentType";
import { keysByReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import { TaskStatusColors, keysByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import HeaderSent from "./HeaderSent";
import { useSentComments } from "./SentCommentsHooks";
import Notification from "./Notification";

// Add CSS styles for column resizing
const tableStyles = `
  .mr-resizer {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 8px;
    background: rgba(255, 255, 255, 0.1);
    cursor: col-resize;
    user-select: none;
    touch-action: none;
    z-index: 10;
  }
  
  .mr-resizer:hover,
  .mr-isResizing {
    background: rgba(127, 209, 59, 0.8);
  }
  
  table {
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: collapse;
    width: 100%;
  }
  
  th, td {
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  /* Prevent text selection during resize */
  .resizing-active {
    user-select: none;
    cursor: col-resize !important;
  }
  
  .resizing-active * {
    pointer-events: none;
  }
  
  .resizing-active .mr-resizer {
    pointer-events: auto !important;
    z-index: 100;
  }
  
  .mr-sortable-header {
    cursor: pointer !important;
  }
  
  .mr-sortable-header:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .mr-header-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .mr-cell-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    display: flex;
    align-items: center;
    height: 100%;
  }
`;

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
  const [isResizing, setIsResizing] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  // Create a storage key for column widths
  const storageKey = `mrColumnWidths-sent-${commentType}`;

  const [columnWidths, setColumnWidths] = useState(() => {
    // Try to load saved column widths from localStorage
    try {
      const savedWidths = localStorage.getItem(storageKey);
      return savedWidths ? JSON.parse(savedWidths) : {};
    } catch (e) {
      return {};
    }
  });

  const data = comments.data;

  const getColumns = useCallback(() => {
    const baseTaskColumns = [
      {
        id: "task_id",
        Header: "Task ID",
        accessor: "taskId",
        Cell: ({ value }) => (value ? <Link to={`task/${value}`}>{value}</Link> : null),
        width: columnWidths["task_id"] || 100,
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
        width: columnWidths["created"] || 180,
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
        width: columnWidths["comment"] || 300,
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
        width: columnWidths["task_status"] || 140,
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
        width: columnWidths["review_status"] || 140,
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
        width: columnWidths["challenge_name"] || 200,
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
        width: columnWidths["created"] || 180,
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
        width: columnWidths["comment"] || 400,
      },
    ];

    return commentType === CommentType.TASK ? baseTaskColumns : baseChallengeColumns;
  }, [commentType, columnWidths]);

  const columns = useMemo(() => getColumns(), [getColumns]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy, columnResizing },
  } = useTable(
    {
      data,
      columns,
      manualPagination: true,
      manualSortBy: true,
      disableSortRemove: true,
      disableMultiSort: true,
      defaultColumn: {
        minWidth: 30,
      },
      initialState: {
        sortBy: [sortCriteria],
      },
      pageCount: comments.count,
      columnResizeMode: "onEnd",
    },
    useSortBy,
    useResizeColumns,
    usePagination,
  );

  // Track resizing state and save column widths when resizing ends
  useEffect(() => {
    const isCurrentlyResizing = !!columnResizing.isResizingColumn;

    // When resizing ends, store the new column widths
    if (isResizing && !isCurrentlyResizing) {
      const newColumnWidths = {};
      headerGroups.forEach((headerGroup) => {
        headerGroup.headers.forEach((column) => {
          if (column.id) {
            newColumnWidths[column.id] = column.width;
          }
        });
      });
      const updatedWidths = { ...columnWidths, ...newColumnWidths };
      setColumnWidths(updatedWidths);

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedWidths));
      } catch (e) {
        console.warn("Failed to save column widths to localStorage", e);
      }
    }

    setIsResizing(isCurrentlyResizing);

    // Add a class to the body during resizing to prevent other interactions
    if (isCurrentlyResizing) {
      document.body.classList.add("resizing-active");
    } else {
      document.body.classList.remove("resizing-active");
    }
  }, [columnResizing.isResizingColumn, headerGroups, columnWidths, storageKey, isResizing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("resizing-active");
    };
  }, []);

  // Add a style element to the document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = tableStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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

  const totalPages = Math.ceil(comments.count / pagination.pageSize);

  // Function to close the notification modal
  const closeNotification = () => {
    setSelectedComment(null);
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

        <div className="mr-w-full mr-overflow-x-auto">
          <table className="mr-w-full mr-text-white mr-links-green-lighter" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => {
                    // Create separate handlers for sorting and resizing
                    const headerProps = column.getHeaderProps();
                    const sortByProps = column.getSortByToggleProps();

                    // Make sure to prevent click event conflicts
                    const onHeaderClick = (e) => {
                      if (!columnResizing.isResizingColumn && !isResizing) {
                        sortByProps.onClick(e);
                      }
                    };

                    return (
                      <th
                        className={`mr-text-left mr-px-2 mr-py-2 mr-border-b mr-border-white-10 ${
                          !isResizing ? "mr-sortable-header" : ""
                        }`}
                        {...headerProps}
                        onClick={onHeaderClick}
                        style={{
                          ...headerProps.style,
                          width: column.width,
                          minWidth: column.minWidth,
                          maxWidth: column.width,
                          position: "relative",
                          cursor: isResizing ? "col-resize" : "pointer",
                          overflow: "hidden",
                        }}
                      >
                        <div className="mr-header-content">
                          <div className="mr-flex mr-items-center mr-justify-between">
                            <div
                              className="mr-flex mr-items-center mr-whitespace-nowrap"
                              style={{
                                cursor: !isResizing ? "pointer" : "auto",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <span>{column.render("Header")}</span>
                              <span className="mr-ml-1 mr-opacity-70">
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    " ▼"
                                  ) : (
                                    " ▲"
                                  )
                                ) : (
                                  <span className="mr-text-xs mr-opacity-50 mr-inline-block">
                                    ↕
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`mr-resizer ${column.isResizing ? "mr-isResizing" : ""}`}
                            {...column.getResizerProps()}
                            onClick={(e) => {
                              // Stop propagation to prevent sorting when clicking resize handle
                              e.stopPropagation();
                            }}
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr className="hover:mr-bg-black-10" {...row.getRowProps()}>
                    {row.cells.map((cell) => {
                      return (
                        <td
                          className="mr-px-1 mr-py-1 mr-border-b mr-border-white-10"
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            maxWidth: cell.column.width,
                            minWidth: cell.column.minWidth,
                            overflow: "hidden",
                            height: "40px",
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
        </div>

        <PaginationControl
          currentPage={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          gotoPage={(page) => setPagination({ ...pagination, page })}
          setPageSize={(pageSize) => setPagination({ ...pagination, pageSize })}
        />

        {/* Render the notification modal */}
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
