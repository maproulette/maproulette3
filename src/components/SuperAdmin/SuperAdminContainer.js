import React, {Component} from "react";
import { connect } from "react-redux";
import { SuperAdminPane } from "./SuperAdmin";
import { fetchAdminChallenges } from "../../services/SuperAdmin/SuperAdminChallenges";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import { withRouter } from "react-router";
import WithManageableProjects from "../AdminPane/HOCs/WithManageableProjects/WithManageableProjects";
import WithMetricsSearch from "./WithMetricsSearch";
import WithFilteredChallenges from "../HOCs/WithFilteredChallenges/WithFilteredChallenges";
import WithStartChallenge from "../HOCs/WithStartChallenge/WithStartChallenge";
import WithBrowsedChallenge from "../HOCs/WithBrowsedChallenge/WithBrowsedChallenge";
import WithExportCsv from "./WithExportCsv";
import { injectIntl } from "react-intl";

const WrappedSuperAdminPane = WithStatus(
  WithCurrentUser(
    withRouter(
      //WithManageableProjects(
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
    constructor(){
      super()
      this.state={
        adminChallenges: [],
      } 
    }
    componentDidMount(){

      this.setState({
        adminChallenges: this.props.adminChallenges
      })
    }
    render(){
       console.log(this.props.adminChallenges)
       return(<WrappedSuperAdminPane challenges={this.props.adminChallenges}/>)
    }
}

const mapStateToProps = state => {
   return {
        adminChallenges: state.entities.adminChallenges
    }
}
const mapDispatchToProps = dispatch => ({
    fetchAdminChallenges: () => {
        dispatch(fetchAdminChallenges());
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(SuperAdminContainer);