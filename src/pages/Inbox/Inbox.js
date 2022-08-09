import React, { useCallback } from 'react'
import ReactTable from 'react-table-6'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { FormattedMessage, FormattedDate, FormattedTime, injectIntl }
       from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _remove from 'lodash/remove'
import _reject from 'lodash/reject'
import _map from 'lodash/map'
import _kebabCase from 'lodash/kebabCase'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithUserNotifications
       from '../../components/HOCs/WithUserNotifications/WithUserNotifications'
import { NotificationType, keysByNotificationType, messagesByNotificationType }
       from '../../services/Notification/NotificationType/NotificationType'
import { intlTableProps } from '../../components/IntlTable/IntlTable'
import SignInButton from '../../components/SignInButton/SignInButton'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import TriStateCheckbox from '../../components/Custom/TriStateCheckbox'
import HeaderNotifications from './HeaderNotifications'
import Notification from './Notification'
import { useNotificationSelection, useNotificationDisplay }
       from './NotificationHooks'
import messages from './Messages'

const Inbox = props => {
  const { user, notifications, markNotificationsRead, deleteNotifications } = props

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
  } = useNotificationSelection(notifications)

  const {
    openNotification,
    displayNotification,
    closeNotification,
  } = useNotificationDisplay()

  const readNotification = useCallback(
    (notification, thread) => {
      displayNotification(notification)

      if (thread) {
        const unread = _reject(thread, {isRead: true})
        if (unread.length > 0) {
          markNotificationsRead(user.id, _map(unread, 'id'))
        }
      }
      else if (!notification.isRead) {
        markNotificationsRead(user.id, [notification.id])
      }
    },
    [displayNotification, markNotificationsRead, user]
  )

  const markReadSelected = useCallback(
    () => {
      if (selectedNotifications.size > 0) {
        markNotificationsRead(user.id, [...selectedNotifications.values()])
        deselectAll()
      }
    },
    [selectedNotifications, markNotificationsRead, deselectAll, user]
  )

  const deleteNotification = useCallback(
    notification => {
      deleteNotifications(user.id, [notification.id])
      closeNotification(notification)
    },
    [user, deleteNotifications, closeNotification]
  )

  const deleteSelected = useCallback(
    () => {
      if (selectedNotifications.size > 0) {
        deleteNotifications(user.id, [...selectedNotifications.values()])
        deselectAll()
      }
    },
    [user, selectedNotifications, deleteNotifications, deselectAll]
  )

  if (!user) {
    return (
      <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
        {props.checkingLoginStatus ?
          <BusySpinner /> :
          <SignInButton {...props} longForm />
        }
      </div>
    )
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
        />

        <ReactTable
          data={props.notifications}
          columns={columns({
            ...props,
            threads,
            groupByTask,
            selectedNotifications,
            toggleNotificationSelection,
            toggleNotificationsSelected,
            allNotificationsSelected,
            anyNotificationInThreadSelected,
            allNotificationsInThreadSelected,
            openNotification,
            readNotification,
            closeNotification,
          })}
          defaultPageSize={props.defaultPageSize}
          defaultSorted={[ {id: 'created', desc: true} ]}
          minRows={1}
          multiSort={false}
          noDataText={<FormattedMessage {...messages.noNotifications} />}
          loading={props.notificationsLoading}
          getTrProps={(state, rowInfo) => {
            const styles = {}
            if (!_get(rowInfo, 'row._original.isRead', false)) {
              styles.fontWeight = 700
            }
            return {style: styles}
          }}
          {...intlTableProps(props.intl)}
        >
          {(state, makeTable) => {
            if (groupByTask) {
              const groupedNotifications = threaded(state.sortedData)
              // We need to modify the table's internal array, we can't replace it
              state.pageRows.length = 0
              state.pageRows.push(...groupedNotifications.slice(state.startRow, state.endRow))
            }

            return makeTable()
          }}
        </ReactTable>
      </section>

      {openNotification &&
        <Notification
          notification={openNotification}
          thread={groupByTask ? threads[openNotification.taskId] : undefined}
          onClose={closeNotification}
          onDelete={deleteNotification}
        />
      }
    </div>
  )
}

const columns = tableProps => [{
  id: 'selected',
  Header: () => {
    return (
      <TriStateCheckbox
        checked={tableProps.allNotificationsSelected}
        indeterminate={
          tableProps.selectedNotifications.size > 0 && !tableProps.allNotificationsSelected
        }
        onChange={() => tableProps.toggleNotificationsSelected()}
      />
    )
  },
  accessor: notification => {
    return tableProps.groupByTask ?
           tableProps.anyNotificationInThreadSelected(tableProps.threads[notification.taskId]) :
           tableProps.selectedNotifications.has(notification.id)
  },
  Cell: ({value, original}) => {
    const thread = tableProps.threads[original.taskId]
    return (
      <TriStateCheckbox
        checked={value}
        indeterminate={
          tableProps.groupByTask &&
          value &&
          !tableProps.allNotificationsInThreadSelected(thread)
        }
        onChange={() => tableProps.toggleNotificationSelection(original, thread)}
      />
    )
  },
  maxWidth: 25,
  sortable: false,
  resizable: false,
}, {
  id: 'taskId',
  Header: tableProps.intl.formatMessage(messages.taskIdLabel),
  accessor: 'taskId',
  minWidth: 100,
  maxWidth: 125,
  filterable: true,
  Cell: ({ value, row }) => (
    <span
      className={classNames(
        "mr-cursor-pointer",
        {"mr-line-through mr-opacity-50": row._original.isRead}
      )}
      onClick={() => tableProps.readNotification(row._original, tableProps.threads[row._original.taskId])}
    >
      {value}
      {tableProps.groupByTask && tableProps.threads[value].length > 1 &&
       <span
         className="mr-ml-2 mr-font-normal mr-text-white mr-text-xs mr-w-5 mr-h-5 mr-rounded-full mr-inline-flex mr-items-center mr-justify-center mr-bg-teal"
       >
         {tableProps.threads[value].length}
       </span>
      }
    </span>
  ),
}, {
  id: 'notificationType',
  Header: tableProps.intl.formatMessage(messages.notificationTypeLabel),
  accessor: 'notificationType',
  sortable: true,
  filterable: true,
  maxWidth: 140,
  Cell: ({ value, row }) => (
    <span
      onClick={() => tableProps.readNotification(row._original, tableProps.threads[row._original.taskId])}
      className={classNames(
        "mr-cursor-pointer mr-text-sm mr-font-medium mr-uppercase",
        `mr-notification-type-${_kebabCase(keysByNotificationType[value])}`,
        {"mr-line-through mr-font-normal mr-opacity-50": row._original.isRead}
      )}
    >
      <FormattedMessage
        {...messagesByNotificationType[value]}
      />
    </span>
  ),
  Filter: ({ filter, onChange }) => {
    const options = [
      <option key="all" value="all">All</option>
    ]

    _each(NotificationType, type => {
      options.push(
        <option key={keysByNotificationType[type]} value={type}>
          {tableProps.intl.formatMessage(messagesByNotificationType[type])}
        </option>
      )
    })

    return (
      <select
        onChange={event => onChange(event.target.value)}
        style={{ width: '100%' }}
        value={filter ? filter.value : 'all'}
      >
        {options}
      </select>
    )
  },
  filterMethod: (filter, row) => {
    return filter.value === "all" ||
           row.notificationType === parseInt(filter.value, 10)
  },
}, {
  id: 'created',
  Header: tableProps.intl.formatMessage(messages.createdLabel),
  accessor: 'modified',
  sortable: true,
  defaultSortDesc: true,
  maxWidth: 180,
  Cell: ({ value, row }) => (
    <span
      className={classNames(
        "mr-cursor-pointer",
        {"mr-line-through mr-opacity-50": row._original.isRead}
      )}
      onClick={() => tableProps.readNotification(row._original, tableProps.threads[row._original.taskId])}
    >
      <FormattedDate value={value} /> <FormattedTime value={value} />
    </span>
  )
}, {
  id: 'fromUsername',
  Header: tableProps.intl.formatMessage(messages.fromUsernameLabel),
  accessor: 'fromUsername',
  maxWidth: 180,
  filterable: true,
  filterAll: true,
  filterMethod: fuzzySearch,
  Cell: ({ value, row }) => (
    <span
      className={classNames(
        "mr-cursor-pointer",
        {"mr-line-through mr-opacity-50": row._original.isRead}
      )}
      onClick={() => tableProps.readNotification(row._original, tableProps.threads[row._original.taskId])}
    >
      {value}
    </span>
  ),
}, {
  id: 'challengeName',
  Header: tableProps.intl.formatMessage(messages.challengeNameLabel),
  accessor: 'challengeName',
  filterable: true,
  filterAll: true,
  filterMethod: fuzzySearch,
  Cell: ({ value, row }) => (
    <span
      className={classNames(
        "mr-cursor-pointer",
        {"mr-line-through mr-opacity-50": row._original.isRead}
      )}
      onClick={() => tableProps.readNotification(row._original, tableProps.threads[row._original.taskId])}
    >
      {value}
    </span>
  )
}, {
  id: 'controls',
  Header: tableProps.intl.formatMessage(messages.controlsLabel),
  sortable: false,
  minWidth: 90,
  maxWidth: 120,
  Cell: ({row}) =>{
    return (
      <ol className="mr-list-reset mr-links-green-lighter mr-inline-flex mr-justify-between mr-font-normal">
        <li>
          <a
            onClick={() => tableProps.readNotification(row._original, tableProps.threads[row._original.taskId])}
          >
            <FormattedMessage {...messages.openNotificationLabel} />
          </a>
        </li>
      </ol>
    )
  }
}]

const threaded = function(sortedNotifications) {
  const workingNotifications = sortedNotifications.slice() // clone
  const threadedNotifications = []
  while (workingNotifications.length > 0) {
    // Add the next notification and then remove all notifications from
    // the same task
    const nextNotification = workingNotifications.shift()
    threadedNotifications.push(nextNotification)
    _remove(workingNotifications, {taskId: nextNotification.taskId})
  }

  return threadedNotifications
}

// Intended to be used as filterMethod on a column using filterAll
const fuzzySearch = function(filter, rows) {
  const fuzzySetup = new Fuse(rows, {keys: [filter.id]})
  return _map(fuzzySetup.search(filter.value), 'item')
}

export default WithCurrentUser(WithUserNotifications(injectIntl(Inbox)))
