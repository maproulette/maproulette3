import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isFinite from 'lodash/isFinite'
import { FormattedMessage } from 'react-intl'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import messages from './Messages'

export default class OwnerContactLink extends Component {
  state = {
    contactUrl: null,
  }

  updateContactOwnerUrl = () => {
    const ownerOSMId = _get(this.props, 'task.parent.owner')
    if (_isFinite(ownerOSMId) && ownerOSMId > 0) {
      this.props.contactTaskOwnerURL(ownerOSMId).then(url =>
        this.setState({contactUrl: url})
      )
    }
    else {
      this.setState({contactUrl: null})
    }
  }

  componentDidMount() {
    this.updateContactOwnerUrl()
  }

  componentDidUpdate(prevProps, prevState) {
    if (_get(prevProps, 'task.parent.owner') !==
        _get(this.props, 'task.parent.owner')) {
      this.updateContactOwnerUrl()
    }
  }

  render() {
    if (!this.state.contactUrl) {
      return null
    }

    return (
      <a className="active-task-details__contact-owner"
          href={this.state.contactUrl}
          target='_blank'>
        <SvgSymbol viewBox='0 0 20 20' sym="envelope-icon" />
        <FormattedMessage {...messages.contactOwnerLabel} />
      </a>
    )
  }
}

OwnerContactLink.propTypes = {
  task: PropTypes.object,
  contactTaskOwnerURL: PropTypes.func.isRequired,
}
