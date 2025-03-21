import _kebabCase from "lodash/kebabCase";
import _reject from "lodash/reject";
import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import React from "react";
import { FormattedDate, FormattedMessage, FormattedTime, injectIntl } from "react-intl";
import {
  useBlockLayout,
  useFilters,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from "react-table";
import BusySpinner from "../../components/BusySpinner/BusySpinner";
import TriStateCheckbox from "../../components/Custom/TriStateCheckbox";
import WithCurrentUser from "../../components/HOCs/WithCurrentUser/WithCurrentUser";
import WithUserNotifications from "../../components/HOCs/WithUserNotifications/WithUserNotifications";
import PaginationControl from "../../components/PaginationControl/PaginationControl";
import SignInButton from "../../components/SignInButton/SignInButton";
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

const DefaultColumnFilter = ({ column: { filterValue, setFilter, Header } }) => (
  <input
    className="mr-input mr-w-full mr-px-2 mr-py-1"
    value={filterValue || ""}
    onChange={(e) => setFilter(e.target.value || undefined)}
    placeholder={`Filter by ${Header}`}
  />
);

const Inbox = (props) => {
  const { user, notifications, markNotificationsRead, deleteNotifications } = props;
  const [tableWidth, setTableWidth] = useState(0);
  const tableContainerRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const updateWidth = () => {
      if (tableContainerRef.current) {
        setTableWidth(tableContainerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const initialTimer = setTimeout(updateWidth, 100);

    const resizeObserver = new ResizeObserver(updateWidth);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      clearTimeout(initialTimer);
      if (tableContainerRef.current) {
        resizeObserver.unobserve(tableContainerRef.current);
      }
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useLayoutEffect(() => {
    if (tableContainerRef.current) {
      setTableWidth(tableContainerRef.current.offsetWidth);
    }
  }, []);

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

  const getInitialColumnWidths = useMemo(() => {
    if (!tableWidth) return {};
    console.log(tableWidth);
    const percentages = {
      selected: 5,
      taskId: 10,
      notificationType: 15,
      created: 15,
      fromUsername: 15,
      challengeName: 20,
      controls: 20,
    };

    return Object.entries(percentages).reduce((acc, [key, percentage]) => {
      acc[key] = Math.max((percentage * tableWidth) / 100, 80);
      return acc;
    }, {});
  }, [tableWidth]);

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
        width: getInitialColumnWidths.selected || 50,
        minWidth: 40,
        disableFilters: true,
      },
      {
        id: "taskId",
        Header: ({ column }) => (
          <div>
            <div>{props.intl.formatMessage(messages.taskIdLabel)}</div>
            <input
              className="mr-input mr-w-full mr-px-2 mr-py-1 mr-mt-1"
              value={column.filterValue || ""}
              onChange={(e) => column.setFilter(e.target.value || undefined)}
              placeholder={`Filter by ${props.intl.formatMessage(messages.taskIdLabel)}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ),
        accessor: "taskId",
        filter: "fuzzyText",
        Cell: ({ value, row }) => {
          const displayId = value === row.original.challengeName ? "" : value;
          return (
            <span>
              {displayId}
              {groupByTask && row.original.threadCount > 1 && (
                <span className="mr-ml-2 mr-font-normal mr-text-white mr-text-xs mr-w-5 mr-h-5 mr-rounded-full mr-inline-flex mr-items-center mr-justify-center mr-bg-teal">
                  {row.original.threadCount}
                </span>
              )}
            </span>
          );
        },
        width: getInitialColumnWidths.taskId || 100,
        minWidth: 80,
      },
      {
        id: "notificationType",
        Header: ({ column }) => (
          <div>
            <div>{props.intl.formatMessage(messages.notificationTypeLabel)}</div>
            <select
              className="mr-select mr-w-full mr-px-2 mr-py-1 mr-mt-1"
              value={column.filterValue === undefined ? "all" : column.filterValue}
              onChange={(e) => {
                column.setFilter(e.target.value === "all" ? undefined : +e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="all">All</option>
              {Object.values(NotificationType).map((type) => (
                <option key={keysByNotificationType[type]} value={type}>
                  {props.intl.formatMessage(messagesByNotificationType[type])}
                </option>
              ))}
            </select>
          </div>
        ),
        accessor: "notificationType",
        Cell: ({ value, row }) => (
          <span className={`mr-notification-type-${_kebabCase(keysByNotificationType[value])}`}>
            <FormattedMessage {...messagesByNotificationType[value]} />
          </span>
        ),
        width: getInitialColumnWidths.notificationType || 150,
        minWidth: 120,
      },
      {
        id: "created",
        Header: props.intl.formatMessage(messages.createdLabel),
        accessor: "created",
        disableFilters: true,
        Cell: ({ value }) => (
          <time dateTime={value}>
            <FormattedDate value={value} /> <FormattedTime value={value} />
          </time>
        ),
        width: getInitialColumnWidths.created || 150,
        minWidth: 120,
      },
      {
        id: "fromUsername",
        Header: ({ column }) => (
          <div>
            <div>{props.intl.formatMessage(messages.fromUsernameLabel)}</div>
            <input
              className="mr-input mr-w-full mr-px-2 mr-py-1 mr-mt-1"
              value={column.filterValue || ""}
              onChange={(e) => column.setFilter(e.target.value || undefined)}
              placeholder={`Filter by ${props.intl.formatMessage(messages.fromUsernameLabel)}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ),
        accessor: "fromUsername",
        filter: "fuzzyText",
        width: getInitialColumnWidths.fromUsername || 150,
        minWidth: 100,
      },
      {
        id: "challengeName",
        Header: ({ column }) => (
          <div>
            <div>{props.intl.formatMessage(messages.challengeNameLabel)}</div>
            <input
              className="mr-input mr-w-full mr-px-2 mr-py-1 mr-mt-1"
              value={column.filterValue || ""}
              onChange={(e) => column.setFilter(e.target.value || undefined)}
              placeholder={`Filter by ${props.intl.formatMessage(messages.challengeNameLabel)}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ),
        accessor: "challengeName",
        filter: "fuzzyText",
        width: getInitialColumnWidths.challengeName || 200,
        minWidth: 150,
      },
      {
        id: "controls",
        Header: props.intl.formatMessage(messages.controlsLabel),
        disableFilters: true,
        Cell: ({ row }) => (
          <ol className="mr-list-reset mr-links-green-lighter mr-inline-flex mr-justify-between mr-font-normal">
            <li>
              <a onClick={() => readNotification(row.original, threads[row.original.taskId])}>
                <FormattedMessage {...messages.openNotificationLabel} />
              </a>
            </li>
          </ol>
        ),
        width: getInitialColumnWidths.controls || 150,
        minWidth: 100,
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
      props.intl,
      getInitialColumnWidths,
    ],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    pageCount,
    gotoPage,
    setPageSize,
    state: { sortBy, pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [DEFAULT_SORT_CRITERIA],
        pageIndex: DEFAULT_PAGINATION.page,
        pageSize: DEFAULT_PAGINATION.pageSize,
      },
      defaultColumn: {
        Filter: DefaultColumnFilter,
        minWidth: 80,
      },
      disableSortRemove: true,
      disableMultiSort: true,
    },
    useBlockLayout,
    useResizeColumns,
    useFilters,
    useSortBy,
    usePagination,
  );

  useEffect(() => {
    if (tableWidth > 0) {
      setTableWidth((prev) => prev + 0.1);
    }
  }, [groupByTask]);

  if (!user) {
    return (
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        {props.checkingLoginStatus ? <BusySpinner /> : <SignInButton {...props} longForm />}
      </div>
    );
  }

  return (
    <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
      <section className="mr-flex-grow mr-w-full mr-bg-black-15 mr-p-4 md:mr-p-8 mr-rounded">
        <HeaderNotifications
          notificationsLoading={props.notificationsLoading}
          groupByTask={groupByTask}
          toggleGroupByTask={toggleGroupByTask}
          refreshNotifications={props.refreshNotifications}
          markReadSelected={markReadSelected}
          deleteSelected={deleteSelected}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div ref={tableContainerRef} className="mr-w-full mr-overflow-x-auto">
          <div
            {...getTableProps()}
            className="mr-w-full mr-text-left mr-text-white mr-table-fixed"
            style={{
              display: "inline-block",
              minWidth: "100%",
              tableLayout: "fixed",
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
                        flex: `0 0 ${column.width}px`,
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
              {props.notificationsLoading ? (
                <div className="mr-text-center mr-p-4">Loading...</div>
              ) : page.length === 0 ? (
                <div className="mr-text-center mr-p-4">No notifications</div>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <div
                      {...row.getRowProps()}
                      className="mr-flex mr-border-b mr-border-white-10 mr-cursor-pointer hover:mr-bg-black-10"
                      style={{
                        fontWeight: !row.original.isRead ? 700 : 400,
                        textDecoration: !row.original.isRead ? "none" : "line-through",
                        opacity: !row.original.isRead ? 1.0 : 0.5,
                      }}
                      onClick={() => readNotification(row.original, threads[row.original.taskId])}
                    >
                      {row.cells.map((cell) => {
                        const column = cell.column;
                        return (
                          <div
                            {...cell.getCellProps()}
                            className="mr-p-2"
                            style={{
                              width: column.width,
                              minWidth: column.minWidth,
                              maxWidth: column.width,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                              flex: `0 0 ${column.width}px`,
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
