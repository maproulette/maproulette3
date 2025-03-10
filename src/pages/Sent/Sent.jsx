import { useEffect, useState } from "react";
import { FormattedDate, FormattedTime, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import { usePagination, useSortBy, useTable } from "react-table";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
import CommentType from "../../services/Comment/CommentType";
import { keysByReviewStatus } from "../../services/Task/TaskReview/TaskReviewStatus";
import { TaskStatusColors, keysByStatus } from "../../services/Task/TaskStatus/TaskStatus";
import HeaderSent from "./HeaderSent";
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

  const data = comments.data;
  const columns = commentType === CommentType.TASK ? TASK_COLUMNS : CHALLENGE_COLUMNS;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy },
  } = useTable(
    {
      data,
      columns,
      manualPagination: true,
      manualSortBy: true,
      pageCount: comments.count,
    },
    useSortBy,
    usePagination,
  );

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

        <table className="mr-w-full mr-text-white mr-links-green-lighter" {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    className="mr-text-left mr-px-2"
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                    {column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr className="mr-border-y mr-border-white-10" {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className="mr-px-2" {...cell.getCellProps()}>
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
          currentPage={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          gotoPage={(page) => setPagination({ ...pagination, page })}
          setPageSize={(pageSize) => setPagination({ ...pagination, pageSize })}
        />
      </section>
    </div>
  );
};

const TASK_COLUMNS = [
  {
    id: "task_id",
    Header: "Task ID",
    accessor: "taskId",
    Cell: ({ value }) => <Link to={`task/${value}`}>{value}</Link>,
  },
  {
    id: "created",
    Header: "Date",
    accessor: "created",
    Cell: ({ value }) => (
      <div className="mr-whitespace-nowrap">
        <FormattedDate value={value} /> <FormattedTime value={value} />
      </div>
    ),
  },
  {
    id: "comment",
    Header: "Comment",
    accessor: "comment",
    Cell: ({ value }) => <p>{value}</p>,
  },
  {
    id: "task_status",
    Header: "Task Status",
    accessor: "taskStatus",
    Cell: ({ value }) => {
      const statusKey = keysByStatus[value];
      const statusColor = TaskStatusColors[value];
      return (
        <span style={{ color: statusColor }}>{statusKey ? statusKey.toUpperCase() : value}</span>
      );
    },
    maxWidth: 140,
  },
  {
    id: "review_status",
    Header: "Review Status",
    accessor: "reviewStatus",
    Cell: ({ value }) => {
      const statusKey = keysByReviewStatus[value];
      return statusKey ? statusKey.toUpperCase() : value;
    },
    maxWidth: 140,
  },
];

const CHALLENGE_COLUMNS = [
  {
    id: "challenge_name",
    Header: "Challenge",
    accessor: "challengeName",
    Cell: ({ value, original }) => (
      <Link to={`browse/challenges/${original.challengeId}?tab=conversation`}>{value}</Link>
    ),
    maxWidth: 200,
  },
  {
    id: "created",
    Header: "Date",
    accessor: "created",
    Cell: ({ value }) => (
      <div className="mr-whitespace-nowrap">
        <FormattedDate value={value} /> <FormattedTime value={value} />
      </div>
    ),
    maxWidth: 200,
  },
  {
    id: "comment",
    Header: "Comment",
    accessor: "comment",
    Cell: ({ value }) => <p>{value}</p>,
  },
];

export default injectIntl(WithCurrentUser(Sent));
