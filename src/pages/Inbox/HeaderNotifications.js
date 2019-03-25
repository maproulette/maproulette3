import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

class HeaderNotifications extends Component {
  render() {
    return (
      <header className="mr-mb-8 mr-pb-4 mr-border-b mr-border-grey-light">
        <div className="sm:mr-flex sm:mr-items-end sm:mr-justify-between mr-mb-4 sm:mr-mb-8">
          <h1 className="mr-h2 mr-text-blue-light mr-mb-2 md:mr-mb-0 md:mr-mr-4">
            <FormattedMessage {...messages.inboxHeader} />
          </h1>
          <div>
            <ul className="mr-list-reset mr-text-sm mr-mb-3 mr-flex lg:mr-justify-end mr-items-center">
              <li>
                <Link to="/user/profile">
                  <FormattedMessage {...messages.manageSubscriptionsLabel} />
                </Link>
              </li>
            </ul>
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
