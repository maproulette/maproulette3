import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { FormattedMessage } from 'react-intl'
import BusySpinner from '../BusySpinner/BusySpinner'
import messages from './Messages'

export default class ChallengeOwnerContactLink extends Component {
  state = {
    contactUrl: null,
    osmUsername: null,
    updatingUrl: false,
  }

  updateContactOwnerUrl = () => {
    const ownerOSMId = _get(this.props, 'task.parent.owner')
    if (_isFinite(ownerOSMId) && ownerOSMId > 0) {
      this.setState({updatingUrl: true})
      this.props.fetchOSMUser(ownerOSMId).then(osmUserData => {
        const username = osmUserData.displayName

        this.setState({
          contactUrl: `https://www.openstreetmap.org/message/new/${username}`,
          osmUsername: username,
          updatingUrl: false,
        })
      }).catch(error => {
        this.setState({updatingUrl: false})
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (_get(prevProps, 'task.parent.owner') !==
        _get(this.props, 'task.parent.owner')) {
      this.setState({
        contactUrl: null,
        osmUsername: null,
        updatingUrl: false,
      })
    }
  }

  render() {
    if (this.state.updatingUrl) {
      return <BusySpinner inline />
    }

    if (!this.state.contactUrl) {
      return (
        <span className="mr-text-green-lighter mr-links-green-lighter">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={this.updateContactOwnerUrl}>
            <FormattedMessage {...messages.contactOwnerLabel} />
          </a>
        </span>
      )
    }

    return (
      <a
				href={this.state.contactUrl}
				target='_blank'
				rel="noopener noreferrer"
      >
        <FormattedMessage
          {...messages.contactLinkLabel}
          values={{owner: this.state.osmUsername}}
        />
      </a>
    )
  }
}

ChallengeOwnerContactLink.propTypes = {
  task: PropTypes.object,
  fetchOSMUser: PropTypes.func.isRequired,
}
