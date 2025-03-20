import { useEffect, useMemo, useRef, useState } from "react";
import { FormattedDate, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { useBlockLayout, usePagination, useResizeColumns, useSortBy, useTable } from "react-table";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
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
  const [selectedComment, setSelectedComment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [tableWidth, setTableWidth] = useState(0);
  const tableContainerRef = useRef(null);

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

  useEffect(() => {
    if (tableContainerRef.current) {
      const updateWidth = () => {
        setTableWidth(tableContainerRef.current.offsetWidth);
      };

      updateWidth();

      const resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(tableContainerRef.current);

      return () => {
        if (tableContainerRef.current) {
          resizeObserver.unobserve(tableContainerRef.current);
        }
      };
    }
  }, []);

  const getInitialColumnWidths = useMemo(() => {
    if (!tableWidth) return {};

    const percentages =
      commentType === CommentType.TASK
        ? { task_id: 10, created: 15, comment: 50, task_status: 12.5, review_status: 12.5 }
        : { challenge_name: 20, created: 15, comment: 65 };

    return Object.entries(percentages).reduce((acc, [key, percentage]) => {
      acc[key] = Math.max((percentage * tableWidth) / 100, 80);
      return acc;
    }, {});
  }, [tableWidth, commentType]);

  const columns = useMemo(() => {
    const initialColumnWidths = getInitialColumnWidths;
    return commentType === CommentType.TASK
      ? taskColumns({ setSelectedComment, initialColumnWidths })
      : challengeColumns({ setSelectedComment, initialColumnWidths });
  }, [commentType, getInitialColumnWidths]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data: comments.data || [],
      initialState: {
        pageIndex: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: [sortCriteria],
      },
      manualPagination: true,
      manualSortBy: true,
      pageCount: Math.ceil(comments.count / pagination.pageSize),
      autoResetPage: false,
      autoResetSortBy: false,
      defaultColumn: {
        minWidth: 80,
      },
      disableSortRemove: true,
      disableMultiSort: true,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy,
    usePagination,
  );

  useEffect(() => {
    if (
      sortBy.length > 0 &&
      (sortBy[0].id !== sortCriteria.id || sortBy[0].desc !== sortCriteria.desc)
    ) {
      setSortCriteria(sortBy[0]);
    }
  }, [sortBy]);

  useEffect(() => {
    if (pageIndex !== pagination.page || pageSize !== pagination.pageSize) {
      setPagination({ page: pageIndex, pageSize });
    }
  }, [pageIndex, pageSize]);

  useEffect(() => {
    if (tableWidth > 0) {
      setTableWidth((prev) => prev + 0.1);
    }
  }, [commentType]);

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
      <section className="mr-flex-grow mr-w-full mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded">
        <HeaderSent
          commentType={commentType}
          refreshData={() => {
            resetTable();
            comments.fetch(props.user?.id, DEFAULT_SORT_CRITERIA, DEFAULT_PAGINATION, searchTerm);
          }}
          setCommentType={(t) => {
            setCommentType(t);
            resetTable();
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div ref={tableContainerRef} className="mr-w-full mr-overflow-x-auto">
          <div
            {...getTableProps()}
            className="mr-w-full mr-text-left mr-text-white"
            style={{
              display: "inline-block",
              minWidth: "100%",
            }}
          >
            <div>
              {headerGroups.map((headerGroup) => (
                <div {...headerGroup.getHeaderGroupProps()} className="mr-flex">
                  {headerGroup.headers.map((column) => (
                    <div
                      {...column.getHeaderProps()}
                      className="mr-p-2 mr-font-medium mr-relative mr-border-b mr-border-white-10 mr-text-white mr-cursor-pointer hover:mr-bg-black-10"
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        position: "relative",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        borderBottom: column.isSorted
                          ? column.isSortedDesc
                            ? "3px solid #fff"
                            : "1px solid rgba(255, 255, 255, 0.1)"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        borderTop:
                          column.isSorted && !column.isSortedDesc ? "3px solid #fff" : "none",
                        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      onClick={(e) => {
                        if (!column.isResizing) {
                          column.toggleSortBy();
                        }
                      }}
                    >
                      {column.render("Header")}
                      <div
                        {...column.getResizerProps()}
                        className={`mr-absolute mr-right-0 mr-top-0 mr-h-full mr-w-2 mr-bg-gray-400 mr-opacity-50 hover:mr-opacity-100 mr-cursor-col-resize ${
                          column.isResizing ? "mr-opacity-100" : ""
                        }`}
                        style={{ touchAction: "none" }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div {...getTableBodyProps()}>
              {comments.loading ? (
                <div className="mr-text-center mr-p-4">Loading...</div>
              ) : page.length === 0 ? (
                <div className="mr-text-center mr-p-4">no data</div>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <div {...row.getRowProps()} className="mr-flex">
                      {row.cells.map((cell) => {
                        const column = cell.column;
                        return (
                          <div
                            {...cell.getCellProps()}
                            className="mr-p-2 mr-border-b mr-border-white-10"
                            style={{
                              width: column.width,
                              minWidth: column.minWidth,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell.render("Cell")}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <PaginationControl
          currentPage={pageIndex}
          totalPages={pageCount || 1}
          pageSize={pageSize}
          gotoPage={gotoPage}
          setPageSize={setPageSize}
        />
      </section>

      {selectedComment && (
        <Notification
          onClose={() => setSelectedComment(null)}
          id={selectedComment.id}
          text={selectedComment.text}
          type={selectedComment.type}
        />
      )}
    </div>
  );
};

const taskColumns = ({ setSelectedComment, initialColumnWidths = {} }) => [
  {
    id: "task_id",
    Header: "Task ID",
    accessor: "taskId",
    Cell: ({ value }) =>
      value ? (
        <Link to={`task/${value}`} target="_blank" rel="noopener noreferrer">
          {value}
        </Link>
      ) : null,
    width: initialColumnWidths.task_id || 120,
    minWidth: 80,
  },
  {
    id: "created",
    Header: "Date",
    accessor: "created",
    Cell: ({ value }) =>
      value ? (
        <span className="mr-text-white">
          <FormattedDate value={value} /> <FormattedTime value={value} />
        </span>
      ) : null,
    width: initialColumnWidths.created || 180,
    minWidth: 150,
  },
  {
    id: "comment",
    Header: "Comment",
    accessor: "comment",
    Cell: ({ value, row }) => {
      return value ? (
        <button
          className="mr-text-green-light hover:mr-text-white mr-truncate mr-w-full mr-text-left"
          onClick={() =>
            setSelectedComment({ id: row.original.taskId, text: value, type: CommentType.TASK })
          }
        >
          {value}
        </button>
      ) : null;
    },
    width: initialColumnWidths.comment || 400,
    minWidth: 200,
  },
  {
    id: "task_status",
    Header: "Task Status",
    accessor: "taskStatus",
    Cell: ({ value }) => {
      if (!value) return null;
      const statusKey = keysByStatus[value];
      const statusColor = TaskStatusColors[value];
      return (
        <span style={{ color: statusColor }}>{statusKey ? statusKey.toUpperCase() : value}</span>
      );
    },
    width: initialColumnWidths.task_status || 120,
    minWidth: 100,
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
    width: initialColumnWidths.review_status || 120,
    minWidth: 100,
  },
];

const challengeColumns = ({ setSelectedComment, initialColumnWidths = {} }) => [
  {
    id: "challenge_name",
    Header: "Challenge",
    accessor: "challengeName",
    Cell: ({ value, row }) => {
      return value ? (
        <Link
          to={`browse/challenges/${row.original.challengeId}?tab=conversation`}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-text-white hover:mr-text-green-light"
        >
          {value}
        </Link>
      ) : null;
    },
    width: initialColumnWidths.challenge_name || 200,
    minWidth: 150,
  },
  {
    id: "created",
    Header: "Date",
    accessor: "created",
    Cell: ({ value }) =>
      value ? (
        <span className="mr-text-white">
          <FormattedDate value={value} /> <FormattedTime value={value} />
        </span>
      ) : null,
    width: initialColumnWidths.created || 180,
    minWidth: 150,
  },
  {
    id: "comment",
    Header: "Comment",
    accessor: "comment",
    Cell: ({ value, row }) => {
      return value ? (
        <button
          className="mr-text-green-light hover:mr-text-white mr-truncate mr-w-full mr-text-left"
          onClick={() =>
            setSelectedComment({
              id: row.original.challengeId,
              text: value,
              type: CommentType.CHALLENGE,
            })
          }
        >
          {value}
        </button>
      ) : null;
    },
    width: initialColumnWidths.comment || 500,
    minWidth: 200,
  },
];

export default injectIntl(WithCurrentUser(Sent));
