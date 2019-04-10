import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import _get from 'lodash/get'
import { fetchUserNotifications, markNotificationsRead, deleteNotifications }
       from '../../../services/User/User'

const WithUserNotifications = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedNotifications(WrappedComponent))

export const mapStateToProps = (state, ownProps) => {
  return {
    notifications: _get(ownProps, 'user.notifications', []),
  }
}

export const mapDispatchToProps = dispatch => bindActionCreators({
  fetchUserNotifications,
  markNotificationsRead,
  deleteNotifications,
}, dispatch)

export const WithLoadedNotifications = function(WrappedComponent) {
  return class extends Component {
    state = {
      notificationsLoading: false,
    }

    loadNotifications = user => {
      if (!user) {
        return
      }

      this.setState({notificationsLoading: true})
      this.props.fetchUserNotifications(user.id).then(
        () => this.setState({notificationsLoading: false})
      )
    }

    componentDidMount() {
      this.loadNotifications(this.props.user)
    }

    componentDidUpdate(prevProps) {
      if (_get(this.props, 'user.id') !== _get(prevProps, 'user.id')) {
        this.loadNotifications(this.props.user)
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          notificationsLoading={this.state.notificationsLoading}
          refreshNotifications={() => this.loadNotifications(this.props.user)}
        />
      )
    }
  }
}

export default WithUserNotifications
