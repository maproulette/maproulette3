import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { fetchActiveFundraisingNotices } from '../../../services/FundraisingNotices/FundraisingNotices'
const ACKNOWLEDGED_SETTING = 'acknowledgedFundraisingNotices'

export const WithfundraisingNotices = function (WrappedComponent) {
  class _WithfundraisingNotices extends Component {
    state = {
      fundraisingNotices: null,
      unacknowledgedNotices: [],
    }

    async componentDidMount() {
      if (!this.state.fundraisingNotices) {
        const activeNotices = await fetchActiveFundraisingNotices()

        this.setState({ fundraisingNotices: activeNotices })
      }
    }

    /**
     * Retrieves all acknowledged notices from the user's app settings
     *
     * @private
     */
    allAcknowledgedNotices = () => {
      if (!this.props.user) {
        return []
      }

      return (
        this.props.getUserAppSetting(this.props.user, ACKNOWLEDGED_SETTING) ||
        []
      )
    }

    /**
     * Retrieves array of notices that have not yet been acknowledged by the
     * user
     *
     * @private
     */
    unacknowledgedNotices = () => {
      if (!this.state.fundraisingNotices) {
        return []
      }

      const acknowledged = this.allAcknowledgedNotices()
      return this.state.fundraisingNotices.filter(
        (notice) => acknowledged.indexOf(notice.uuid) === -1
      )
    }

    /**
     * Acknowledges the given notice
     */
    acknowledgeNotice = async (notice) => {
      if (!this.props.user || !notice.uuid) {
        return
      }

      const updatedAcknowledgements = this.allAcknowledgedNotices().slice()
      updatedAcknowledgements.push(notice.uuid)
      await this.props.updateUserAppSetting(this.props.user.id, {
        [ACKNOWLEDGED_SETTING]: updatedAcknowledgements,
      })
    }

    render() {
      const remainingNotices = this.unacknowledgedNotices(
        this.state.fundraisingNotices
      )

      return (
        <WrappedComponent
          {...this.props}
          remainingNotices={remainingNotices}
          acknowledgeNotice={(notice) => this.acknowledgeNotice(notice)}
        />
      )
    }
  }

  _WithfundraisingNotices.propTypes = {
    user: PropTypes.object,
    getUserAppSetting: PropTypes.func.isRequired,
    updateUserAppSetting: PropTypes.func.isRequired,
  }

  return _WithfundraisingNotices
}

export default (WrappedComponent) => WithfundraisingNotices(WrappedComponent)
