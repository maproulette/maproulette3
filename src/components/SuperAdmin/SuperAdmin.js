import React from "react";
import PropTypes from "prop-types";
import { withRouter} from "react-router-dom";
import { FormattedMessage, injectIntl } from "react-intl"
import { useState } from "react";
import _get from 'lodash/get'
import _set from 'lodash/set'
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import WithStatus from "../HOCs/WithStatus/WithStatus";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";
import MetricsTable from "./MetricsTable";
import BusySpinner from "../BusySpinner/BusySpinner";
import WithChallengeSearch from "../HOCs/WithSearch/WithChallengeSearch";
import WithFilteredChallenges from '../HOCs/WithFilteredChallenges/WithFilteredChallenges'
import WithSearchResults from '../HOCs/WithSearchResults/WithSearchResults'
import WithManageableProjects from "../AdminPane/HOCs/WithManageableProjects/WithManageableProjects";
import WithStartChallenge from "../HOCs/WithStartChallenge/WithStartChallenge";
import WithBrowsedChallenge from "../HOCs/WithBrowsedChallenge/WithBrowsedChallenge";
import WithChallenges from '../HOCs/WithChallenges/WithChallenges'
import WithExportCsv from "./WithExportCsv";
import WithMetricsFilter from './WithMetricsFilter'
import DashboardFilterToggle from "../AdminPane/Manage/DashboardFilterToggle/DashboardFilterToggle";
import MetricsHeader from "./MetricsHeader";
import messages from './Messages'
/**
 * SuperAdminPane is the top-level component for super administration functions. It has a
 * User/Project/Challenge metrics tab for management of users, projects, challenges, and tasks, and display of various summary metrics. 
 * It's worth noting that only super admins have access to SuperAdminPane.
 *
 */
const  SuperAdminPane = (props) => {
    console.log(props)
    const [currentTab, setCurrentTab] = useState('challenge')
    // HOC
    const VisibleFilterToggle = DashboardFilterToggle("challenge", "visible");
    const ArchivedFilterToggle = DashboardFilterToggle("challenge", "archived");
    const VirtualProjectFilterToggle = DashboardFilterToggle("project", "virtual");
    const manager = AsManager(props.user);
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
        <MetricsHeader {...props} setCurrentTab={setCurrentTab} currentTab={currentTab}/>
        {currentTab !== 'user' && <div className='mr-flex mr-justify-end mr-p-4 mr-pt-6'>
          <VisibleFilterToggle
            {...props}
            dashboardEntityFilters={props.entityFilters}
            toggleEntityFilter={props.toggleFilter}
            filterToggleLabel={<FormattedMessage {...messages.visible} />}
          />
          <ArchivedFilterToggle
            {...props}
            dashboardEntityFilters={props.entityFilters}
            toggleEntityFilter={props.toggleFilter}
            filterToggleLabel={<FormattedMessage {...messages.archived} />}
          />
          {currentTab === 'project' && <VirtualProjectFilterToggle
            {...props}
            dashboardEntityFilters={props.entityFilters}
            toggleEntityFilter={props.toggleFilter}
            filterToggleLabel={<FormattedMessage {...messages.virtual} />}
          />}
          <button
            color="primary"
            type="button"
            className="mr-leading-none mr-button--dark mr-ml-4 mr-mr-1"
            onClick={() => {
              props.downloadCsv()
            }}>
            <FormattedMessage {...messages.download} />
          </button>
        </div>}
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
        WithManageableProjects(
          WithChallenges(
            WithChallengeSearch(
              WithFilteredChallenges(
                WithSearchResults(
                  WithStartChallenge(
                    WithBrowsedChallenge(
                      WithMetricsFilter(
                        WithExportCsv(
                          injectIntl(SuperAdminPane),
                        )
                      )
                    )
                  ),
                  'challenges',
                  'challenges'
                ))))))));


