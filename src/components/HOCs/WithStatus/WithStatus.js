import { connect } from "react-redux";
import { CHECKING_LOGIN_STATUS, FETCHING_CHALLENGES_STATUS } from "../../../services/Status/Status";

export const mapStateToProps = (state) => {
  return {
    fetchingChallenges: state.currentStatus?.[FETCHING_CHALLENGES_STATUS] ?? [],

    checkingLoginStatus: state.currentStatus?.[CHECKING_LOGIN_STATUS] ?? false,
  };
};

export default (WrappedComponent) => connect(mapStateToProps)(WrappedComponent);
