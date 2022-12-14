import React, {Component} from 'react'
import { connect } from 'react-redux'
import { SuperAdminPane } from './SuperAdmin'
import { fetchAdminChallenges } from '../../services/SuperAdmin/SuperAdminChallenges'
import { fetchAdminProjects } from '../../services/SuperAdmin/SuperAdminProjects'
import WithCurrentUser from '../HOCs/WithCurrentUser/WithCurrentUser'
import { withRouter } from 'react-router'
import WithMetricsSearch from './WithMetricsSearch'
import WithFilteredChallenges from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithMetricsFilter from './WithMetricsFilter'
import WithExportCsv from './WithExportCsv'
import { injectIntl } from 'react-intl'

const WrappedSuperAdminPane = 
  WithCurrentUser(
    withRouter(
      WithMetricsSearch(
        WithMetricsFilter(
          WithFilteredChallenges(
            WithExportCsv(
              injectIntl(SuperAdminPane),
            )
          )
        )
      ),
    ))

class SuperAdminContainer extends Component {
  componentDidMount() {
    const searchQuery = {onlyEnabled: false}
    this.props.fetchAdminChallenges(searchQuery)
    this.props.fetchAdminProjects()
  }

  render() {
    return(
      <WrappedSuperAdminPane challenges={this.props.adminChallenges} projects={this.props.adminProjects} isloadingCompleted={this.props.loadingChallenges || this.props.loadingProjects} />
    )
  }
}

const mapStateToProps = state => {
  return {
    adminChallenges: state.entities?.adminChallenges?.data || [],
    adminProjects: state.entities?.adminProjects?.data || [],
    loadingChallenges: state.entities?.adminChallenges?.loading,
    loadingProjects: state.entities?.adminProjects?.loading
  }
}
const mapDispatchToProps = dispatch => ({
  fetchAdminChallenges: (query) => {
    dispatch(fetchAdminChallenges(query));
  },
  fetchAdminProjects: () => {
    dispatch(fetchAdminProjects())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SuperAdminContainer);