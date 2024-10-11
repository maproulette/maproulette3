import { Component } from 'react'
import { connect } from 'react-redux'
import { SuperAdminPane } from './SuperAdmin'
import { fetchAdminChallenges } from '../../services/SuperAdmin/SuperAdminChallenges'
import { fetchAdminProjects } from '../../services/SuperAdmin/SuperAdminProjects'
import { fetchAdminUsers } from '../../services/SuperAdmin/SuperAdminUsers'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import AsManager from '../../interactions/User/AsManager'
import { withRouter } from 'react-router'
import WithMetricsSearch from './WithMetricsSearch'
import WithFilteredChallenges from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithMetricsFilter from './WithMetricsFilter'
import WithExportCsv from './WithExportCsv'
import { injectIntl } from 'react-intl'
import { denormalize } from 'normalizr'
import { challengeSchema } from '../../services/Challenge/Challenge'

const WrappedSuperAdminPane = WithCurrentUser(
  withRouter(
    WithMetricsSearch(
      WithMetricsFilter(
        WithFilteredChallenges(WithExportCsv(injectIntl(SuperAdminPane)))
      )
    )
  )
)

class SuperAdminContainer extends Component {
  componentDidMount() {
    if (window.env.REACT_APP_DISABLE_SUPER_ADMIN_METRICS !== 'true') {
      if (AsManager(this.props.user).isSuperUser()) {
        const searchQuery = { onlyEnabled: false }
        this.props.fetchAdminChallenges(searchQuery)
        this.props.fetchAdminProjects()
        this.props.fetchAdminUsers()
      }
    }
  }

  render() {
    if (window.env.REACT_APP_DISABLE_SUPER_ADMIN_METRICS === 'true') {
      return <div>Super Admin Metrics is currently disabled</div>
    }

    return (
      <WrappedSuperAdminPane
        challenges={this.props.adminChallenges}
        projects={this.props.adminProjects}
        users={this.props.adminUsers}
        isloadingCompleted={
          this.props.loadingChallenges &&
          this.props.loadingProjects &&
          this.props.loadingUsers
        }
      />
    )
  }
}

const mapStateToProps = (state) => {
  const adminChallenges = state.entities?.adminChallenges?.data.map(
    (challenge) => denormalize(challenge, challengeSchema(), state.entities)
  )

  return {
    adminChallenges: adminChallenges || [],
    adminProjects: state.entities?.adminProjects?.data || [],
    adminUsers: state.entities?.adminUsers?.data || [],
    loadingChallenges: state.entities?.adminChallenges?.loadingCompleted,
    loadingProjects: state.entities?.adminProjects?.loadingCompleted,
    loadingUsers: state.entities?.adminUsers?.loadingCompleted,
  }
}
const mapDispatchToProps = (dispatch) => ({
  fetchAdminChallenges: (query) => {
    dispatch(fetchAdminChallenges(query))
  },
  fetchAdminProjects: () => {
    dispatch(fetchAdminProjects())
  },
  fetchAdminUsers: () => {
    dispatch(fetchAdminUsers())
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(SuperAdminContainer))
