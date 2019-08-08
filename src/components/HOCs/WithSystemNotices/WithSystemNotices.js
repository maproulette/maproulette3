import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { fetchActiveSystemNotices }
       from '../../../services/SystemNotices/SystemNotices'

const ACKNOWLEDGED_SETTING = 'acknowledgedNotices'

/**
 * WithSystemNotices provides the WrappedComponent with an array of active,
 * unacknowledged system notices along with methods for acknowledging them
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithSystemNotices = function(WrappedComponent) {
  class _WithSystemNotices extends Component {
    state = {
      systemNotices: null,
      unacknowledgedNotices: [],
    }

    async componentDidMount() {
      if (!this.state.systemNotices) {
        const activeNotices = await fetchActiveSystemNotices()

        this.setState({systemNotices: activeNotices})
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

      return this.props.getUserAppSetting(this.props.user, ACKNOWLEDGED_SETTING) || []
    }

    /**
     * Retrieves array of notices that have not yet been acknowledged by the
     * user
     *
     * @private
     */
    unacknowledgedNotices = () => {
      if (!this.state.systemNotices) {
        return []
      }

      const acknowledged = this.allAcknowledgedNotices()
      return this.state.systemNotices.filter(
        notice => acknowledged.indexOf(notice.uuid) === -1
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
      const remainingNotices = this.unacknowledgedNotices(this.state.systemNotices)
      return <WrappedComponent
               {...this.props}
               allSystemNotices={this.state.systemNotices}
               newSystemNotices={remainingNotices}
               acknowledgeNotice={notice => this.acknowledgeNotice(notice)}
             />
    }
  }

  _WithSystemNotices.propTypes = {
    user: PropTypes.object,
    getUserAppSetting: PropTypes.func.isRequired,
    updateUserAppSetting: PropTypes.func.isRequired,
  }

  return _WithSystemNotices
}

export default WrappedComponent => WithSystemNotices(WrappedComponent)
