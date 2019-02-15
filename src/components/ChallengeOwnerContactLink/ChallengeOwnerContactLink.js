import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
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
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a 
          className="mr-flex mr-items-center"
          onClick={this.updateContactOwnerUrl}
        >
          <SvgSymbol
            sym="envelope-icon"
            viewBox="0 0 20 16"
            className="mr-fill-current mr-w-3 mr-h-3"
          />
          <span className="mr-ml-1">
            <FormattedMessage {...messages.contactOwnerLabel} />
          </span>
        </a>
      )
    }

    return (
      <a
        className="mr-flex mr-items-center"
				href={this.state.contactUrl}
				target='_blank'
				rel="noopener noreferrer"
      >
        <SvgSymbol
          sym="envelope-icon"
          viewBox="0 0 20 16"
          className="mr-fill-current mr-w-3 mr-h-3"
        />

        <span className="mr-ml-1">
          <FormattedMessage
            {...messages.contactLinkLabel}
            values={{owner: this.state.osmUsername}}
          />
        </span>
      </a>
    )
  }
}

ChallengeOwnerContactLink.propTypes = {
  task: PropTypes.object,
  fetchOSMUser: PropTypes.func.isRequired,
}
