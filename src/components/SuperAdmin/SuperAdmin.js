import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl"
import { useState } from "react";
import AsManager from "../../interactions/User/AsManager";
import SignIn from "../../pages/SignIn/SignIn";
import MetricsTable from "./MetricsTable";
import BusySpinner from "../BusySpinner/BusySpinner";
import DashboardFilterToggle from "../AdminPane/Manage/DashboardFilterToggle/DashboardFilterToggle";
import MetricsFilterToggle from "./MetricsFilterToggle";
import MetricsHeader from "./MetricsHeader";
import messages from './Messages';
/**
 * SuperAdminPane is the top-level component for super administration functions. It has a
 * User/Project/Challenge metrics tab for management of users, projects, challenges, and tasks, and display of various summary metrics. 
 * It's worth noting that only super admins have access to SuperAdminPane.
 *
 */
export const SuperAdminPane = (props) => {
  const [currentTab, setCurrentTab] = useState('challenge')
  //HOC
  // const VisibleFilterToggle = DashboardFilterToggle("challenge", "visible");
  // const ArchivedFilterToggle = DashboardFilterToggle("challenge", "archived");
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

  const showingArchived = props.history?.location.search.includes("archived=true");
  return manager.isSuperUser() ? (
    <div className='mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse'>
      <MetricsHeader {...props} setCurrentTab={setCurrentTab} currentTab={currentTab} />
      {currentTab !== 'user' && <div className='mr-flex mr-justify-end mr-p-4 mr-pt-6'>
        <MetricsFilterToggle {...props} filterName='archived' showingFilter={showingArchived} />
        {/* <VisibleFilterToggle
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
        /> */}
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
            props.downloadCsv(props.challenges)
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
