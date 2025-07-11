import { denormalize } from "normalizr";
import { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import AsManager from "../../interactions/User/AsManager";
import { challengeSchema } from "../../services/Challenge/Challenge";
import { fetchAdminChallenges } from "../../services/SuperAdmin/SuperAdminChallenges";
import { fetchAdminProjects } from "../../services/SuperAdmin/SuperAdminProjects";
import { fetchAdminUsers } from "../../services/SuperAdmin/SuperAdminUsers";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import WithFilteredChallenges from "../HOCs/WithFilteredChallenges/WithFilteredChallenges";
import { SuperAdminPane } from "./SuperAdmin";
import WithExportCsv from "./WithExportCsv";
import WithMetricsFilter from "./WithMetricsFilter";
import WithMetricsSearch from "./WithMetricsSearch";

const WrappedSuperAdminPane = WithCurrentUser(
  withRouter(
    WithMetricsSearch(
      WithMetricsFilter(WithFilteredChallenges(WithExportCsv(injectIntl(SuperAdminPane)))),
    ),
  ),
);

class SuperAdminContainer extends Component {
  componentDidMount() {
    this.fetchDataIfReady();
  }

  componentDidUpdate(prevProps) {
    // Fetch data when user becomes available
    if (!prevProps.user && this.props.user) {
      this.fetchDataIfReady();
    }
  }

  fetchDataIfReady = () => {
    if (window.env.REACT_APP_DISABLE_SUPER_ADMIN_METRICS !== "true") {
      if (this.props.user && AsManager(this.props.user).isSuperUser()) {
        const searchQuery = { onlyEnabled: false };
        this.props.fetchAdminChallenges(searchQuery);
        this.props.fetchAdminProjects();
        this.props.fetchAdminUsers();
      }
    }
  };

  render() {
    if (window.env.REACT_APP_DISABLE_SUPER_ADMIN_METRICS === "true") {
      return <div>Super Admin Metrics is currently disabled</div>;
    }

    return (
      <WrappedSuperAdminPane
        challenges={this.props.adminChallenges}
        projects={this.props.adminProjects}
        users={this.props.adminUsers}
        isloadingCompleted={
          this.props.loadingChallenges && this.props.loadingProjects && this.props.loadingUsers
        }
      />
    );
  }
}

const mapStateToProps = (state) => {
  const adminChallenges = state.entities?.adminChallenges?.data.map((challenge) =>
    denormalize(challenge, challengeSchema(), state.entities),
  );

  return {
    adminChallenges: adminChallenges || [],
    adminProjects: state.entities?.adminProjects?.data || [],
    adminUsers: state.entities?.adminUsers?.data || [],
    loadingChallenges: state.entities?.adminChallenges?.loadingCompleted,
    loadingProjects: state.entities?.adminProjects?.loadingCompleted,
    loadingUsers: state.entities?.adminUsers?.loadingCompleted,
  };
};
const mapDispatchToProps = (dispatch) => ({
  fetchAdminChallenges: (query) => {
    dispatch(fetchAdminChallenges(query));
  },
  fetchAdminProjects: () => {
    dispatch(fetchAdminProjects());
  },
  fetchAdminUsers: () => {
    dispatch(fetchAdminUsers());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(SuperAdminContainer));
