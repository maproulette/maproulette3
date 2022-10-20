import React, { Component } from "react";
import PropTypes from "prop-types";
import { Switch, Route, withRouter } from "react-router-dom";
import { FormattedMessage, injectIntl} from "react-intl"
import MediaQuery from "react-responsive";
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import MetricsTable from "./MetricsTable";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithChallengeSearch from "../HOCs/WithSearch/WithChallengeSearch";
import WithFilteredChallenges from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults'
import WithClusteredTasks from "../HOCs/WithClusteredTasks/WithClusteredTasks";
import WithMapBoundedTasks from "../HOCs/WithMapBoundedTasks/WithMapBoundedTasks";
import WithStartChallenge from "../HOCs/WithStartChallenge/WithStartChallenge";
import WithBrowsedChallenge from "../HOCs/WithBrowsedChallenge/WithBrowsedChallenge";
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import MetricsHeader from "./MetricsHeader";
import ChallengeResultList from "../ChallengePane/ChallengeResultList/ChallengeResultList";
import WithMetricsSearch from "./WithMetricsSearch";

/**
 * SuperAdminPane is the top-level component for super administration functions. It has a
 * User/Project/Challenge metrics tab for management of users, projects, challenges, and tasks, and or display of various summary metrics. 
 * It's worth noting that all logged-in users have access to the AdminPane.
 *
 */
export class SuperAdminPane extends Component {
  componentDidUpdate(prevProps) {
    if (
      this.props.location.pathname !== prevProps.location.pathname &&
      this.props.location.search !== prevProps.location.search
    ) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    // The user needs to be logged in.
    const manager = AsManager(this.props.user);
    const ChallengeResults = ChallengeResultList
    if (!manager.isLoggedIn()) {
      return this.props.checkingLoginStatus ? (
        <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <BusySpinner />
        </div>
      ) : (
        <SignIn {...this.props} />
      );
    }

    return manager.isSuperUser() ? (
      <div className='mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse'>
        <MetricsHeader {...this.props}/>
        <MetricsTable {...this.props}/>
      </div>
    ) : (
      <div>
        You are not a super admin
      </div>
    )
  }
}

SuperAdminPane.propTypes = {
  /** router location */
  location: PropTypes.object.isRequired,
};

export default 
  WithStatus(
    WithCurrentUser(
      withRouter(
        WithChallenges(
          WithChallengeSearch(
            WithClusteredTasks(
              WithMapBoundedTasks(
                WithFilteredChallenges(
                  WithSearchResults(
                    WithStartChallenge(
                      WithBrowsedChallenge(injectIntl(SuperAdminPane))
                    ),
                    'challenges',
                    'challenges'
                  )))))))));


