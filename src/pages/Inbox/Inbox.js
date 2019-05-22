import React, { Component } from 'react'
import ReactTable from 'react-table'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { FormattedMessage, FormattedDate, FormattedTime, injectIntl }
       from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _find from 'lodash/find'
import _groupBy from 'lodash/groupBy'
import _remove from 'lodash/remove'
import _reject from 'lodash/reject'
import _map from 'lodash/map'
import _kebabCase from 'lodash/kebabCase'
import _isArray from 'lodash/isArray'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithUserNotifications
       from '../../components/HOCs/WithUserNotifications/WithUserNotifications'
import { NotificationType, keysByNotificationType, messagesByNotificationType }
       from '../../services/Notification/NotificationType/NotificationType'
import SignInButton from '../../components/SignInButton/SignInButton'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import TriStateCheckbox from '../../components/Bulma/TriStateCheckbox'
import HeaderNotifications from './HeaderNotifications'
import Notification from './Notification'
import messages from './Messages'

class Inbox extends Component {
  visibleNotifications = []  // Outside of state

  state = {
    groupByTask: true,
    selectedNotifications: new Set(),
    openNotification: null,
  }

  toggleGroupByTask = () => {
    this.setState({groupByTask: !this.state.groupByTask})
  }

  toggleNotificationSelection = (notification, thread) => {
    const targetNotifications = _isArray(thread) ? thread : [notification]
    if (this.allNotificationsInThreadSelected(targetNotifications)) {
      _each(targetNotifications,
            target => this.state.selectedNotifications.delete(target.id))
    }
    else {
      _each(targetNotifications,
            target => this.state.selectedNotifications.add(target.id))
    }

    this.setState({selectedNotifications: this.state.selectedNotifications})
  }

  toggleVisibleNotificationsSelected = threads => {
    // Base toggle behavior on selection state of visible notifications only
    if (this.hasUnselectedVisibleNotifications()) {
      this.selectAllVisible(threads)
    }
    else if (this.state.selectedNotifications.size > 0) {
      this.deselectAll()
    }
  }

  hasUnselectedVisibleNotifications = () => {
    return !!_find(this.visibleNotifications,
                   notification => !this.state.selectedNotifications.has(notification._original.id))
  }

  allVisibleNotificationsSelected = () => {
    return this.visibleNotifications.length > 0 &&
           !this.hasUnselectedVisibleNotifications()
  }

  anyNotificationInThreadSelected = thread => {
    return !!_find(thread,
                   notification => this.state.selectedNotifications.has(notification.id))
  }

  allNotificationsInThreadSelected = thread => {
    return !_find(thread,
                  notification => !this.state.selectedNotifications.has(notification.id))
  }

  selectAllVisible = threads => {
    // Deselect non-visible notifications to avoid inadvertent deletion
    this.state.selectedNotifications.clear()

    _each(this.visibleNotifications, notification => {
      // select whole thread if appropriate
      if (this.state.groupByTask) {
        _each(threads[notification._original.taskId],
              n => this.state.selectedNotifications.add(n.id))
      }
      else {
        this.state.selectedNotifications.add(notification._original.id)
      }
    })
    this.setState({selectedNotifications: this.state.selectedNotifications})
  }

  deselectAll = () => {
    this.state.selectedNotifications.clear()
    this.setState({selectedNotifications: this.state.selectedNotifications})
  }

  readNotification = (notification, thread) => {
    this.setState({openNotification: notification})

    if (thread) {
      const unread = _reject(thread, {isRead: true})
      if (unread.length > 0) {
        this.props.markNotificationsRead(this.props.user.id, _map(unread, 'id'))
      }
    }
    else if (!notification.isRead) {
      this.props.markNotificationsRead(this.props.user.id, [notification.id])
    }
  }

  closeNotification = notification => {
    if (notification === this.state.openNotification) {
      this.setState({openNotification: null})
    }
  }

  markReadSelected = () => {
    if (this.state.selectedNotifications.size > 0) {
      this.props.markNotificationsRead(this.props.user.id,
                                       [...this.state.selectedNotifications.values()])
      this.deselectAll()
    }
  }

  deleteNotification = notification => {
    this.props.deleteNotifications(this.props.user.id, [notification.id])
    this.closeNotification(notification)

    // Remove from selection map if needed
    if (this.state.selectedNotifications.has(notification.id)) {
      this.state.selectedNotifications.delete(notification.id)
      this.setState({selectedNotifications: this.state.selectedNotifications})
    }
  }

  deleteSelected = () => {
    if (this.state.selectedNotifications.size > 0) {
      this.props.deleteNotifications(this.props.user.id,
                                     [...this.state.selectedNotifications.values()])
      this.deselectAll()
    }
  }

  render() {
    if (!this.props.user) {
      return (
        <div className="mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          {this.props.checkingLoginStatus ?
           <BusySpinner /> :
           <SignInButton {...this.props} longForm />
          }
        </div>
      )
    }

    const threads =
      this.state.groupByTask ? _groupBy(this.props.notifications, 'taskId') : {}

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
        <section className="mr-flex-grow mr-w-full mr-bg-white mr-p-4 md:mr-p-8 mr-rounded">
          <HeaderNotifications
            notificationsLoading={this.props.notificationsLoading}
            groupByTask={this.state.groupByTask}
            toggleGroupByTask={this.toggleGroupByTask}
            refreshNotifications={this.props.refreshNotifications}
            markReadSelected={this.markReadSelected}
            deleteSelected={this.deleteSelected}
          />

          <ReactTable
            data={this.props.notifications}
            columns={columns({
              ...this.props,
              threads,
              groupByTask: this.state.groupByTask,
              selectedNotifications: this.state.selectedNotifications,
              toggleNotificationSelection: this.toggleNotificationSelection,
              toggleVisibleNotificationsSelected: this.toggleVisibleNotificationsSelected,
              allVisibleNotificationsSelected: this.allVisibleNotificationsSelected,
              anyNotificationInThreadSelected: this.anyNotificationInThreadSelected,
              allNotificationsInThreadSelected: this.allNotificationsInThreadSelected,
              openNotification: this.state.openNotification,
              readNotification: this.readNotification,
              closeNotification: this.closeNotification,
            })}
            defaultPageSize={this.props.defaultPageSize}
            defaultSorted={[ {id: 'created', desc: true} ]}
            minRows={1}
            multiSort={false}
            noDataText={<FormattedMessage {...messages.noNotifications} />}
            loading={this.props.notificationsLoading}
            getTrProps={(state, rowInfo, column) => {
              const styles = {}
              if (!_get(rowInfo, 'row._original.isRead', false)) {
                styles.fontWeight = 700
              }
              return {style: styles}
            }}
          >
            {(state, makeTable, instance) => {
              // Keep track of the visible rows (all pages) so bulk-selection is accurate
              this.visibleNotifications = this.state.groupByTask ? threaded(state.sortedData) :
                                                                   state.sortedData

              if (this.state.groupByTask) {
                // We need to modify the table's internal array, we can't replace it
                state.pageRows.length = 0
                state.pageRows.push(...this.visibleNotifications.slice(state.startRow, state.endRow))
              }

              return makeTable()
            }}
          </ReactTable>
        </section>

        {this.state.openNotification &&
          <Notification
            notification={this.state.openNotification}
            thread={this.state.groupByTask ? threads[this.state.openNotification.taskId] : undefined}
            onClose={this.closeNotification}
            onDelete={this.deleteNotification}
          />
        }
      </div>
    )
  }
}

const columns = tableProps => [{
  id: 'selected',
  Header: () => (
    <input
      type="checkbox"
      checked={tableProps.allVisibleNotificationsSelected()}
      onChange={() => tableProps.toggleVisibleNotificationsSelected(tableProps.threads)}
    />
  ),
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
      <ol className="mr-list-reset mr-inline-flex mr-justify-between mr-font-normal">
        <li>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
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
  return fuzzySetup.search(filter.value)
}

export default WithCurrentUser(WithUserNotifications(injectIntl(Inbox)))
