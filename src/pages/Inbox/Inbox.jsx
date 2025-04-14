import _kebabCase from "lodash/kebabCase";
import _reject from "lodash/reject";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  
  .mr-table-header-cell {
    overflow: visible;
    position: relative;
  }
  
  .mr-table-cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Ensure the table doesn't jump during resizing */
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
  
  /* Add transparent overlay when resizing to prevent issues with mouse events */
  body.react-resizing * {
    cursor: col-resize !important;
  }
  
  .mr-sortable-header {
    cursor: pointer !important;
  }
  
  .mr-sortable-header:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .mr-sortable-header span, 
  .mr-sortable-header div:not(.mr-header-filter) {
    cursor: pointer !important;
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
  
  .resizing-active .mr-sortable-header {
    background-color: transparent !important;
    cursor: col-resize !important;
  }
  
  .resizing-active .mr-header-filter,
  .resizing-active .mr-filter-input,
  .resizing-active .mr-filter-clear {
    pointer-events: none !important;
  }

  .mr-header-filter {
    margin-top: 0.25rem;
    max-width: 100%;
    overflow: hidden;
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

  .mr-filter-input {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    width: 100%;
    height: 1.5rem;
    border-radius: 2px;
  }

  .mr-filter-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .mr-filter-clear {
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }

  .mr-filter-clear:hover {
    color: #7fd13b;
  }
`;

const useDebounce = (callback, delay) => {
  const [timer, setTimer] = useState(null);

  return (value) => {
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => callback(value), delay);
    setTimer(newTimer);
  };
};

const SearchFilter = ({ value: filterValue, onChange: setFilter, placeholder }) => {
  const [inputValue, setInputValue] = useState(filterValue || "");
  const debouncedSetFilter = useDebounce(setFilter, 500);

  return (
    <div
      className="mr-relative mr-w-full mr-flex mr-items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        className="mr-filter-input"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          debouncedSetFilter(e.target.value || undefined);
        }}
        placeholder={placeholder}
        onClick={(e) => e.stopPropagation()}
      />
      {inputValue && (
        <button
          className="mr-filter-clear mr-ml-2"
          onClick={(e) => {
            e.stopPropagation();
            setInputValue("");
            setFilter(undefined);
          }}
        >
          <SvgSymbol
            sym="icon-close"
            viewBox="0 0 20 20"
            className="mr-fill-current mr-w-2 mr-h-2"
          />
        </button>
      )}
    </div>
  );
};

const Inbox = (props) => {
  const { user, notifications, markNotificationsRead, deleteNotifications } = props;
  const [isResizing, setIsResizing] = useState(false);

  // Create a storage key for column widths
  const storageKey = "mrColumnWidths-inbox";

  // Load saved column widths from localStorage
  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const savedWidths = localStorage.getItem(storageKey);
      return savedWidths ? JSON.parse(savedWidths) : {};
    } catch (e) {
      return {};
    }
  });

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
          <SearchFilter value={filterValue} onChange={setFilter} placeholder="Search task ID..." />
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
            className="mr-filter-input"
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
        Cell: ({ value, row }) => (
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
          <SearchFilter value={filterValue} onChange={setFilter} placeholder="Search username..." />
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
          <SearchFilter
            value={filterValue}
            onChange={setFilter}
            placeholder="Search challenge..."
          />
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
            <ol className="mr-list-reset mr-links-green-lighter mr-inline-flex mr-justify-between mr-font-normal">
              <li>
                <a onClick={() => readNotification(row.original, threads[row.original.taskId])}>
                  <FormattedMessage {...messages.openNotificationLabel} />
                </a>
              </li>
            </ol>
          </div>
        ),
        width: 100,
        minWidth: 80,
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
      props.intl,
    ],
  );

  // Apply stored column widths to the columns config
  const columnsWithStoredWidths = useMemo(() => {
    return columns.map((column) => {
      if (columnWidths[column.id]) {
        return {
          ...column,
          width: columnWidths[column.id],
        };
      }
      return column;
    });
  }, [columns, columnWidths]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: { sortBy, pageIndex, pageSize, columnResizing },
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns: columnsWithStoredWidths,
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
    },
    useFilters,
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
  }, [columnResizing.isResizingColumn, headerGroups, columnWidths, storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("resizing-active");
    };
  }, []);

  // Add table styles to the document head
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = tableStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (!user) {
    return (
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        {props.checkingLoginStatus ? <BusySpinner /> : <SignInButton {...props} longForm />}
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / pageSize);

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
        />

        <div className="mr-w-full mr-overflow-x-auto">
          <table className="mr-w-full mr-text-white mr-links-green-lighter" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => {
                      // Create separate handlers for sorting and resizing
                      const headerProps = column.getHeaderProps();
                      const sortByProps = !column.disableSortBy
                        ? column.getSortByToggleProps()
                        : {};

                      // Make sure to prevent click event conflicts
                      const onHeaderClick = (e) => {
                        if (
                          !column.disableSortBy &&
                          !columnResizing.isResizingColumn &&
                          !isResizing
                        ) {
                          sortByProps.onClick(e);
                        }
                      };

                      return (
                        <th
                          key={column.id}
                          className={`mr-text-left mr-px-2 mr-py-2 mr-border-b mr-border-white-10 ${
                            !column.disableSortBy && !isResizing ? "mr-sortable-header" : ""
                          }`}
                          {...headerProps}
                          onClick={onHeaderClick}
                          style={{
                            ...headerProps.style,
                            width: column.width,
                            minWidth: column.minWidth,
                            maxWidth: column.width,
                            position: "relative",
                            cursor: isResizing
                              ? "col-resize"
                              : !column.disableSortBy
                                ? "pointer"
                                : "auto",
                            overflow: "hidden",
                          }}
                        >
                          <div className="mr-header-content">
                            <div className="mr-flex mr-items-center mr-justify-between">
                              <div
                                className="mr-flex mr-items-center mr-whitespace-nowrap"
                                style={{
                                  cursor: !column.disableSortBy && !isResizing ? "pointer" : "auto",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <span>{column.render("Header")}</span>
                                {!column.disableSortBy && (
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
                                )}
                              </div>
                            </div>
                            {column.canFilter && (
                              <div
                                className="mr-header-filter mr-mr-2"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  overflow: "hidden",
                                  maxWidth: "100%",
                                }}
                              >
                                {column.render("Filter")}
                              </div>
                            )}
                            {!column.disableResizing && (
                              <div
                                className={`mr-resizer ${column.isResizing ? "mr-isResizing" : ""}`}
                                {...column.getResizerProps()}
                                onClick={(e) => {
                                  // Stop propagation to prevent sorting when clicking resize handle
                                  e.stopPropagation();
                                }}
                              />
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    key={row.id}
                    {...row.getRowProps()}
                    className="mr-border-y mr-border-white-10 mr-cursor-pointer hover:mr-bg-black-10"
                    style={{
                      fontWeight: !row.original.isRead ? 700 : 400,
                      textDecoration: !row.original.isRead ? "none" : "line-through",
                      opacity: !row.original.isRead ? 1.0 : 0.5,
                    }}
                    onClick={() => readNotification(row.original, threads[row.original.taskId])}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <td
                          key={cell.column.id}
                          className="mr-px-2 mr-align-middle"
                          {...cell.getCellProps()}
                          style={{
                            ...cell.getCellProps().style,
                            maxWidth: cell.column.width,
                            minWidth: cell.column.minWidth,
                            overflow: "hidden",
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
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <PaginationControl
          currentPage={pageIndex}
          totalPages={totalPages}
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
