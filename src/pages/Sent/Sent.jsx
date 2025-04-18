import { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedDate, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { usePagination, useResizeColumns, useSortBy, useTable } from "react-table";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
import {
  TableContainer,
  renderTableHeader,
  useColumnWidthStorage,
  useResizingState,
} from "../../components/TableShared/ResizableTable";
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

  // Create a storage key for column widths
  const storageKey = `mrColumnWidths-sent-${commentType}`;

  // Initialize column widths with storage
  const [columnWidths, saveColumnWidths] = useColumnWidthStorage(storageKey);

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

  // Track resizing state
  const isResizing = useResizingState(columnResizing, headerGroups, columnWidths, saveColumnWidths);

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

        <TableContainer>
          <table className="mr-w-full mr-text-white mr-links-green-lighter" {...getTableProps()}>
            <thead>{renderTableHeader(headerGroups, isResizing, columnResizing)}</thead>

            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr className="hover:mr-bg-black-10" {...row.getRowProps()} key={row.id}>
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
                          key={cell.column.id}
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
        </TableContainer>

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
