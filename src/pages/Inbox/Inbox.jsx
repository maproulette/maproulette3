import _kebabCase from "lodash/kebabCase";
import _reject from "lodash/reject";
import { Fragment, useCallback, useEffect, useMemo, useRef } from "react";
import React from "react";
import { FormattedDate, FormattedMessage, FormattedTime, injectIntl } from "react-intl";
import { useFilters, usePagination, useResizeColumns, useSortBy, useTable } from "react-table";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
import TriStateCheckbox from "../../components/Custom/TriStateCheckbox";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import WithUserNotifications from "../../components/HOCs/WithUserNotifications/WithUserNotifications";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
import SignInButton from "../../components/SignInButton/SignInButton";
import SvgSymbol from "../../components/SvgSymbol/SvgSymbol";
import { SearchFilter } from "../../components/TableShared/EnhancedTable";
import {
  cellStyles,
  inputStyles,
  linkStyles,
  rowStyles,
  tableStyles,
} from "../../components/TableShared/TableStyles";
import {
  NotificationType,
  keysByNotificationType,
  messagesByNotificationType,
} from "../../services/Notification/NotificationType/NotificationType";
import HeaderNotifications from "./HeaderNotifications";
import messages from "./Messages";
import Notification from "./Notification";
import { useNotificationDisplay, useNotificationSelection } from "./NotificationHooks";

const DEFAULT_SORT_CRITERIA = {
  id: "created",
  desc: true,
};

const DEFAULT_PAGINATION = {
  page: 0,
  pageSize: 25,
};

const Inbox = (props) => {
  const {
    user,
    notifications,
    markNotificationsRead,
    markNotificationsUnread,
    deleteNotifications,
  } = props;

  const {
    groupByTask,
    selectedNotifications,
    deselectAll,
    allNotificationsSelected,
    allNotificationsInThreadSelected,
    toggleNotificationSelection,
    toggleNotificationsSelected,
    anyNotificationInThreadSelected,
    toggleGroupByTask,
    threads,
  } = useNotificationSelection(notifications);

  const { openNotification, displayNotification, closeNotification } = useNotificationDisplay();
  const isInitialMount = useRef(true);

  const readNotification = useCallback(
    (notification, thread) => {
      displayNotification(notification);

      if (thread) {
        const unread = _reject(thread, { isRead: true });
        if (unread.length > 0) {
          markNotificationsRead(
            user.id,
            unread.map((m) => m.id),
          );
        }
      } else if (!notification.isRead) {
        markNotificationsRead(user.id, [notification.id]);
      }
    },
    [displayNotification, markNotificationsRead, user],
  );

  const markReadSelected = useCallback(() => {
    if (selectedNotifications.size > 0) {
      markNotificationsRead(user.id, [...selectedNotifications.values()]);
      deselectAll();
    }
  }, [selectedNotifications, markNotificationsRead, deselectAll, user]);

  const markUnreadSelected = useCallback(() => {
    if (selectedNotifications.size > 0) {
      markNotificationsUnread(user.id, [...selectedNotifications.values()]);
      deselectAll();
    }
  }, [selectedNotifications, markNotificationsUnread, deselectAll, user]);

  const markNotificationUnread = useCallback(
    (notification) => {
      markNotificationsUnread(user.id, [notification.id]);
    },
    [user, markNotificationsUnread],
  );

  const deleteNotification = useCallback(
    (notification) => {
      deleteNotifications(user.id, [notification.id]);
      closeNotification(notification);
    },
    [user, deleteNotifications, closeNotification],
  );

  const deleteSelected = useCallback(() => {
    if (selectedNotifications.size > 0) {
      deleteNotifications(user.id, [...selectedNotifications.values()]);
      deselectAll();
    }
  }, [user, selectedNotifications, deleteNotifications, deselectAll]);

  const data = React.useMemo(() => {
    if (!groupByTask) {
      return notifications;
    }

    const workingNotifications = [...notifications];
    const threadedNotifications = [];
    const seen = new Set();

    workingNotifications.sort((a, b) => {
      return new Date(b.modified) - new Date(a.modified);
    });

    for (const notification of workingNotifications) {
      if (!seen.has(notification.taskId)) {
        seen.add(notification.taskId);
        threadedNotifications.push({
          ...notification,
          thread: threads[notification.taskId],
          threadCount: threads[notification.taskId].length,
        });
      }
    }

    return threadedNotifications;
  }, [notifications, groupByTask, threads]);

  const columns = useMemo(
    () => [
      {
        id: "selected",
        Header: () => (
          <TriStateCheckbox
            checked={allNotificationsSelected}
            indeterminate={selectedNotifications.size > 0 && !allNotificationsSelected}
            onChange={() => toggleNotificationsSelected()}
          />
        ),
        Cell: ({ row }) => {
          const thread = threads[row.original.taskId];
          const isSelected = groupByTask
            ? anyNotificationInThreadSelected(thread)
            : selectedNotifications.has(row.original.id);
          return (
            <TriStateCheckbox
              checked={isSelected}
              indeterminate={groupByTask && isSelected && !allNotificationsInThreadSelected(thread)}
              onChange={() => toggleNotificationSelection(row.original, thread)}
            />
          );
        },
        width: 40,
        minWidth: 40,
        disableSortBy: true,
        disableResizing: true,
      },
      {
        id: "taskId",
        Header: props.intl.formatMessage(messages.taskIdLabel),
        accessor: "taskId",
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
        Cell: ({ value, row }) => {
          const displayId = value === row.original.challengeName ? "" : value;
          return (
            <div className="mr-cell-content">
              {displayId}
              {groupByTask && row.original.threadCount > 1 && (
                <span className="mr-ml-2 mr-font-normal mr-text-white mr-text-xs mr-w-5 mr-h-5 mr-rounded-full mr-inline-flex mr-items-center mr-justify-center mr-bg-teal">
                  {row.original.threadCount}
                </span>
              )}
            </div>
          );
        },
        width: 100,
        minWidth: 80,
      },
      {
        id: "notificationType",
        Header: props.intl.formatMessage(messages.notificationTypeLabel),
        accessor: "notificationType",
        Filter: ({ column: { setFilter } }) => (
          <select
            className={inputStyles}
            style={{ width: "90%" }}
            onChange={(e) => setFilter(e.target.value === "all" ? null : +e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="all">All</option>
            {Object.values(NotificationType).map((type) => (
              <option key={keysByNotificationType[type]} value={type}>
                {props.intl.formatMessage(messagesByNotificationType[type])}
              </option>
            ))}
          </select>
        ),
        Cell: ({ value }) => (
          <div className="mr-cell-content">
            <span className={`mr-notification-type-${_kebabCase(keysByNotificationType[value])}`}>
              <FormattedMessage {...messagesByNotificationType[value]} />
            </span>
          </div>
        ),
        width: 180,
        minWidth: 120,
      },
      {
        id: "created",
        Header: props.intl.formatMessage(messages.createdLabel),
        accessor: "created",
        disableFilters: true,
        Cell: ({ value }) => (
          <div className="mr-cell-content">
            <time dateTime={value}>
              <FormattedDate value={value} /> <FormattedTime value={value} />
            </time>
          </div>
        ),
        width: 160,
        minWidth: 140,
      },
      {
        id: "fromUsername",
        Header: props.intl.formatMessage(messages.fromUsernameLabel),
        accessor: "fromUsername",
        Filter: ({ column: { filterValue, setFilter } }) => (
          <div className="mr-flex mr-items-center" onClick={(e) => e.stopPropagation()}>
            <SearchFilter
              value={filterValue}
              onChange={setFilter}
              placeholder="Search username..."
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
        Cell: ({ value }) => <div className="mr-cell-content">{value}</div>,
        width: 150,
        minWidth: 120,
      },
      {
        id: "challengeName",
        Header: props.intl.formatMessage(messages.challengeNameLabel),
        accessor: "challengeName",
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
        Cell: ({ value }) => <div className="mr-cell-content">{value}</div>,
        width: 180,
        minWidth: 150,
      },
      {
        id: "controls",
        Header: props.intl.formatMessage(messages.controlsLabel),
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="mr-cell-content">
            <ol className="mr-list-reset mr-links-green-lighter mr-inline-flex mr-justify-between mr-font-normal mr-space-x-2">
              <li>
                <a
                  className={linkStyles}
                  onClick={() => readNotification(row.original, threads[row.original.taskId])}
                >
                  <FormattedMessage {...messages.openNotificationLabel} />
                </a>
              </li>
              {row.original.isRead && (
                <li>
                  <a
                    className={`${linkStyles} hover:mr-text-yellow`}
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationUnread(row.original);
                    }}
                  >
                    <FormattedMessage {...messages.markSelectedUnreadLabel} />
                  </a>
                </li>
              )}
            </ol>
          </div>
        ),
        width: 140,
        minWidth: 120,
        disableSortBy: true,
      },
    ],
    [
      allNotificationsSelected,
      selectedNotifications,
      toggleNotificationsSelected,
      groupByTask,
      anyNotificationInThreadSelected,
      allNotificationsInThreadSelected,
      toggleNotificationSelection,
      threads,
      readNotification,
      markNotificationUnread,
      props.intl,
    ],
  );

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
      initialState: {
        sortBy: [DEFAULT_SORT_CRITERIA],
        pageIndex: DEFAULT_PAGINATION.page,
        pageSize: DEFAULT_PAGINATION.pageSize,
      },
      disableSortRemove: true,
      defaultColumn: {
        Filter: () => null,
        minWidth: 30,
      },
      columnResizeMode: "onEnd",
      autoResetPage: false,
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

  if (!user) {
    return (
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        {props.checkingLoginStatus ? <BusySpinner /> : <SignInButton {...props} longForm />}
      </div>
    );
  }

  const totalPages = Math.ceil(filteredRows.length / pageSize);

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
      <section className="mr-flex-grow mr-w-full mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded">
        <HeaderNotifications
          notificationsLoading={props.notificationsLoading}
          groupByTask={groupByTask}
          toggleGroupByTask={toggleGroupByTask}
          refreshNotifications={props.refreshNotifications}
          markReadSelected={markReadSelected}
          markUnreadSelected={markUnreadSelected}
          deleteSelected={deleteSelected}
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
              {headerGroups.map((headerGroup) => (
                <Fragment key={headerGroup.id}>
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className={`mr-px-2 mr-text-left mr-border-gray-600 mr-relative ${
                          column.canResize ? "mr-border-r mr-border-gray-500" : ""
                        }`}
                        key={column.id}
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
                    {headerGroup.headers.map((column) => (
                      <th
                        key={`filter-${column.id}`}
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
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    key={row.id}
                    {...row.getRowProps()}
                    className={rowStyles}
                    style={{
                      fontWeight: !row.original.isRead ? 700 : 400,
                      textDecoration: !row.original.isRead ? "none" : "line-through",
                      opacity: !row.original.isRead ? 1.0 : 0.5,
                    }}
                    onClick={() => readNotification(row.original, threads[row.original.taskId])}
                  >
                    {row.cells.map((cell) => (
                      <td
                        key={cell.column.id}
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
                        onClick={(e) => {
                          if (cell.column.id === "selected") {
                            e.stopPropagation();
                          }
                        }}
                      >
                        {cell.render("Cell")}
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
          pageCount={totalPages}
          pageSize={pageSize}
          gotoPage={gotoPage}
          setPageSize={setPageSize}
          previousPage={previousPage}
          nextPage={nextPage}
        />
      </section>

      {openNotification && (
        <Notification
          notification={openNotification}
          thread={groupByTask ? threads[openNotification.taskId] : undefined}
          onClose={closeNotification}
          onDelete={deleteNotification}
        />
      )}
    </div>
  );
};

export default WithCurrentUser(WithUserNotifications(injectIntl(Inbox)));
