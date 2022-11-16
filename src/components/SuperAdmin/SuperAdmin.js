import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import AsManager from '../../interactions/User/AsManager'
import SignIn from '../../pages/SignIn/SignIn'
import MetricsTable from './MetricsTable'
import BusySpinner from '../BusySpinner/BusySpinner'
import internalFilterToggle from './internalFilterToggle'
import MetricsHeader from './MetricsHeader'
import messages from './Messages'
import { useEffect } from 'react'
import queryString from 'query-string'
/**
 * SuperAdminPane is the top-level component for super administration functions. It has a
 * User/Project/Challenge metrics tab for management of users, projects and challenges, and display of various summary metrics. 
 * It's worth noting that only super admins have access to SuperAdminPane.
 *
 */
export const SuperAdminPane = (props) => {
  useEffect( () => {
  props.clearSearch()
  props.clearSearchFilters()
  } , [props.match.path])

  const params = queryString.parse(props.location.search)
  const currentTab = params['tab'] ? params['tab'] : 'challenges'
  //HOC
  const VisibleFilterToggle = internalFilterToggle('challenge', 'visible');
  const ArchivedFilterToggle = internalFilterToggle('challenge', 'archived');
  const VirtualProjectFilterToggle = internalFilterToggle('project', 'virtual');
  const manager = AsManager(props.user);
  if (!manager.isLoggedIn()) {
    return props.checkingLoginStatus ? (
      <div className='admin mr-flex mr-justify-center mr-py-8 mr-w-full mr-bg-blue'>
        <BusySpinner />
      </div>
    ) : (
      <SignIn {...props} />
    );
  }

  return manager.isSuperUser() ? (
    <div className='mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse'>
      <MetricsHeader {...props} currentTab={currentTab} />
      {currentTab !== 'users' && <div className='mr-flex mr-justify-end mr-p-4 mr-pt-6'>
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
        {currentTab === 'projects' && <VirtualProjectFilterToggle
          {...props}
          dashboardEntityFilters={props.entityFilters}
          toggleEntityFilter={props.toggleFilter}
          filterToggleLabel={<FormattedMessage {...messages.virtual} />}
        />}
        <button
          color='primary'
          type='button'
          className='mr-leading-none mr-button--dark mr-ml-4 mr-mr-1'
          onClick={() => {
            props.downloadCsv(currentTab, props)
          }}>
          <FormattedMessage {...messages.download} />
        </button>
      </div>}
      <MetricsTable {...props} currentTab={currentTab}/>
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
