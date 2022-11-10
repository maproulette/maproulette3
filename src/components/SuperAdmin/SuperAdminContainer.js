import React, {Component} from "react";
import { connect } from "react-redux";
import { SuperAdminPane } from "./SuperAdmin";
import { fetchAdminChallenges } from "../../services/SuperAdmin/SuperAdminChallenges";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import { withRouter } from "react-router";
import WithMetricsSearch from "./WithMetricsSearch";
import WithFilteredChallenges from "../HOCs/WithFilteredChallenges/WithFilteredChallenges";
import WithStartChallenge from "../HOCs/WithStartChallenge/WithStartChallenge";
import WithBrowsedChallenge from "../HOCs/WithBrowsedChallenge/WithBrowsedChallenge";
import WithExportCsv from "./WithExportCsv";
import { injectIntl } from "react-intl";

const WrappedSuperAdminPane = 
  WithStatus(
    WithCurrentUser(
      withRouter(
        WithMetricsSearch(
          WithFilteredChallenges(
            WithStartChallenge(
              WithBrowsedChallenge(
                WithExportCsv(
                  injectIntl(SuperAdminPane),
                )
              )
            )
          ),
        ))))

class SuperAdminContainer extends Component {
  componentDidMount() {
    this.props.fetchAdminChallenges(this.state)
  }

  render() {
    return(
      <WrappedSuperAdminPane challenges={this.props.adminChallenges} fetchingChallenges={this.props.loading}/>
    )
  }
}

const mapStateToProps = state => {
  return {
    adminChallenges: state.entities?.adminChallenges?.data || [],
    loading: state.entities?.adminChallenges?.loading
  }
}
const mapDispatchToProps = dispatch => ({
  fetchAdminChallenges: (query) => {
    dispatch(fetchAdminChallenges(query));
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(SuperAdminContainer);