import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { FormattedMessage, injectIntl } from "react-intl"
import { useState } from "react";
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
import WithDashboardEntityFilter from "../AdminPane/HOCs/WithDashboardEntityFilter/WithDashboardEntityFilter";
import WithManageableProjects from "../AdminPane/HOCs/WithManageableProjects/WithManageableProjects";
import WithProjectManagement from "../AdminPane/HOCs/WithProjectManagement/WithProjectManagement";
import {
  challengePassesFilters,
  defaultChallengeFilters,
} from "../../services/Widget/ChallengeFilter/ChallengeFilter";
import DashboardFilterToggle from "../AdminPane/Manage/DashboardFilterToggle/DashboardFilterToggle";
import MetricsHeader from "./MetricsHeader";
import ChallengeResultList from "../ChallengePane/ChallengeResultList/ChallengeResultList";
import messages from './Messages'
import { set } from "date-fns";
/**
 * SuperAdminPane is the top-level component for super administration functions. It has a
 * User/Project/Challenge metrics tab for management of users, projects, challenges, and tasks, and display of various summary metrics. 
 * It's worth noting that only super admins have access to SuperAdminPane.
 *
 */
const  SuperAdminPane = (props) => {
  
    console.log(props)
    const VisibleFilterToggle = DashboardFilterToggle("challenge", "visible");
    // The user needs to be logged in.
    const [currentTab, setCurrentTab] = useState('challenge')
    const manager = AsManager(props.user);
    const ChallengeResults = ChallengeResultList
    if (!manager.isLoggedIn()) {
      return props.checkingLoginStatus ? (
        <div className="admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue">
          <BusySpinner />
        </div>
      ) : (
        <SignIn {...props} />
      );
    }

    return manager.isSuperUser() ? (
      <div className='mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse'>
        <MetricsHeader {...props} setCurrentTab={setCurrentTab}/>
        {/* <VisibleFilterToggle
         {...props}
         dashboardEntityFilters={props.dashboardChallengeFilters}
         toggleEntityFilter={props.toggleDashboardChallengeFilter}
         filterToggleLabel={<FormattedMessage {...messages.discoverable} />}
        /> */}
        <MetricsTable {...props} currentTab={currentTab} />
      </div>
    ) : (
      <div>
        You are not a super admin
      </div>
    )
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
                      WithBrowsedChallenge(
                        injectIntl(SuperAdminPane),
                      )
                    ),
                    'challenges',
                    'challenges'
                  )))))))));


