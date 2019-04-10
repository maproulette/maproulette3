import React, { Component } from 'react'
import ReactTable from 'react-table'
import Fuse from 'fuse.js'
import { FormattedMessage, FormattedDate, FormattedTime, injectIntl }
       from 'react-intl'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _kebabCase from 'lodash/kebabCase'
import WithCurrentUser
       from '../../components/HOCs/WithCurrentUser/WithCurrentUser'
import WithUserNotifications
       from '../../components/HOCs/WithUserNotifications/WithUserNotifications'
import { NotificationType, keysByNotificationType, messagesByNotificationType }
       from '../../services/Notification/NotificationType/NotificationType'
import SignInButton from '../../components/SignInButton/SignInButton'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import HeaderNotifications from './HeaderNotifications'
import Notification from './Notification'
import messages from './Messages'

class Inbox extends Component {
  state = {
    selectedNotifications: new Map(),
    openNotification: null,
  }

  toggleNotificationSelection = notification => {
    if (this.state.selectedNotifications.has(notification.id)) {
      this.state.selectedNotifications.delete(notification.id)
    }
    else {
      this.state.selectedNotifications.set(notification.id, true)
    }

    this.setState({selectedNotifications: this.state.selectedNotifications})
  }

  toggleAllNotificationsSelected = () => {
    if (this.state.selectedNotifications.size < this.props.notifications.length) {
      this.selectAll()
    }
    else if (this.state.selectedNotifications.size > 0) {
      this.deselectAll()
    }
  }

  allNotificationsSelected = () => {
    return this.props.notifications.length > 0 &&
           this.state.selectedNotifications.size === this.props.notifications.length
  }

  selectAll = () => {
    _each(this.props.notifications, notification => {
      this.state.selectedNotifications.set(notification.id, true)
    })
    this.setState({selectedNotifications: this.state.selectedNotifications})
  }

  deselectAll = () => {
    this.state.selectedNotifications.clear()
    this.setState({selectedNotifications: this.state.selectedNotifications})
  }

  readNotification = notification => {
    this.setState({openNotification: notification})
    if (!notification.isRead) {
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
                                       [...this.state.selectedNotifications.keys()])
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
                                     [...this.state.selectedNotifications.keys()])
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

    return (
      <div className="mr-bg-gradient-r-green-dark-blue mr-px-6 mr-py-8 md:mr-py-12 mr-flex mr-justify-center mr-items-center">
        <section className="mr-flex-grow mr-w-full mr-bg-white mr-p-4 md:mr-p-8 mr-rounded">
          <HeaderNotifications
            notificationsLoading={this.props.notificationsLoading}
            refreshNotifications={this.props.refreshNotifications}
            markReadSelected={this.markReadSelected}
            deleteSelected={this.deleteSelected}
          />

          <ReactTable
            data={this.props.notifications}
            columns={columns({
              ...this.props,
              selectedNotifications: this.state.selectedNotifications,
              toggleNotficationSelection: this.toggleNotificationSelection,
              toggleAllNotificationsSelected: this.toggleAllNotificationsSelected,
              allNotificationsSelected: this.allNotificationsSelected,
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
                styles.fontWeight = 700;
              }
              return {style: styles}
            }}
          />
        </section>

        {this.state.openNotification &&
          <Notification
            notification={this.state.openNotification}
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
      checked={tableProps.allNotificationsSelected()}
      onChange={tableProps.toggleAllNotificationsSelected}
    />
  ),
  accessor: notification => tableProps.selectedNotifications.has(notification.id),
  Cell: ({value, original}) => (
    <input
      type="checkbox"
      checked={value}
      onChange={() => tableProps.toggleNotficationSelection(original)}
    />
  ),
  maxWidth: 25,
  sortable: false,
  resizable: false,
}, {
  id: 'notificationType',
  Header: tableProps.intl.formatMessage(messages.notificationTypeLabel),
  accessor: 'notificationType',
  sortable: true,
  filterable: true,
  maxWidth: 140,
  Cell: ({ value, row }) => (
    <span
      onClick={() => tableProps.readNotification(row._original)}
      className={`mr-cursor-pointer mr-text-sm mr-font-medium mr-uppercase mr-notification-type-${_kebabCase(keysByNotificationType[value])}`}
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
      className="mr-cursor-pointer"
      onClick={() => tableProps.readNotification(row._original)}
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
      className="mr-cursor-pointer"
      onClick={() => tableProps.readNotification(row._original)}
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
      className="mr-cursor-pointer"
      onClick={() => tableProps.readNotification(row._original)}
    >
      {value}
    </span>
  )
}, {
  id: 'taskId',
  Header: tableProps.intl.formatMessage(messages.taskIdLabel),
  accessor: 'taskId',
  minWidth: 100,
  maxWidth: 110,
  filterable: true,
  Cell: ({ value, row }) => (
    <span
      className="mr-cursor-pointer"
      onClick={() => tableProps.readNotification(row._original)}
    >
      {value}
    </span>
  ),
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
          <a onClick={() => tableProps.readNotification(row._original)}>
            <FormattedMessage {...messages.openNotificationLabel} />
          </a>
        </li>
      </ol>
    )
  }
}]

// Intended to be used as filterMethod on a column using filterAll
const fuzzySearch = function(filter, rows) {
  const fuzzySetup = new Fuse(rows, {keys: [filter.id]})
  return fuzzySetup.search(filter.value)
}

export default WithCurrentUser(WithUserNotifications(injectIntl(Inbox)))
