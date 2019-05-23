import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import BusySpinner from '../../components/BusySpinner/BusySpinner'
import messages from './Messages'

class HeaderNotifications extends Component {
  render() {
    return (
      <header className="mr-mb-8 mr-pb-4 mr-border-b mr-border-grey-light">
        <div className="sm:mr-flex sm:mr-justify-between mr-mb-2 sm:mr-mb-4">
          <div>
            <h1 className="mr-h2 mr-text-blue-light mr-mb-2 md:mr-mb-0 md:mr-mr-4">
              <FormattedMessage {...messages.inboxHeader} />
            </h1>
            <ul className="mr-list-reset mr-text-sm mr-mt-0">
              <li className="mr-mb-4">
                <input
                  type="checkbox"
                  checked={this.props.groupByTask}
                  onChange={this.props.toggleGroupByTask}
                /> Group by Task
              </li>
              <li>
                <Link to="/user/profile">
                  <FormattedMessage {...messages.manageSubscriptionsLabel} />
                </Link>
              </li>
            </ul>
          </div>
          <div>
            {this.props.notificationsLoading ?
             <BusySpinner lightMode /> :
             <button
               className="mr-button mr-button--green"
               onClick={this.props.refreshNotifications}
             >
               <FormattedMessage {...messages.refreshNotificationsLabel} />
             </button>
            }
          </div>
        </div>
        <div className="mr-flex mr-justify-end mr-items-center">
          <ul className="mr-list-reset mr-leading-tight mr-flex mr-items-center mr-text-grey-light">
            <li className="mr-mr-3 mr-pr-3 mr-border-r mr-border-grey-light">
              <button
                onClick={this.props.markReadSelected}
                className="mr-text-current hover:mr-text-grey"
              >
                <FormattedMessage {...messages.markSelectedReadLabel} />
              </button>
            </li>
            <li>
              <button
                onClick={this.props.deleteSelected}
                className="mr-text-current hover:mr-text-red"
              >
                <FormattedMessage {...messages.deleteSelectedLabel} />
              </button>
            </li>
          </ul>
        </div>
      </header>
    )
  }
}

HeaderNotifications.propTypes = {
  markReadSelected: PropTypes.func.isRequired,
  deleteSelected: PropTypes.func.isRequired,
}

export default HeaderNotifications
