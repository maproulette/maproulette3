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
import DatePicker from "react-datepicker";
import { useState } from 'react'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
/**
 * SuperAdminPane is the top-level component for super administration functions. It has a
 * User/Project/Challenge metrics tab for management of users, projects and challenges, and display of various summary metrics. 
 * It's worth noting that only super admins have access to SuperAdminPane.
 *
 */
export const SuperAdminPane = (props) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const params = queryString.parse(props.location.search)
  const currentTab = params['tab'] ? params['tab'] : 'challenges'

  const formatDateFromTab = (date) => {
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() + (offset * 60 * 1000))
    return date
  }

  const fromDateTab = params['from'] ? formatDateFromTab(new Date(params['from'])) : null
  const endDateTab = params['to'] ? formatDateFromTab(new Date(params['to'])) : null

  useEffect(() => {
    if (props.location.search === '') {
      props.clearSearch()
      props.clearSearchFilters()
      props.setSearchSort({ sortBy: 'default' })
    }

    setStartDate(fromDateTab)
    setEndDate(endDateTab)
  }, [])

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

  const formatDate = (date) => {
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset * 60 * 1000))
    return date.toISOString().split('T')[0]
  }

  const handleStartDate = (date) => {
    setStartDate(date)
    const formattedDate = formatDate(date)
    props.toggleStartDate(formattedDate)
  }

  const handleEndDate = (date) => {
    setEndDate(date)
    const formattedDate = formatDate(date)
    props.toggleEndDate(formattedDate)
  }

  const clearDate = () => {
    props.clearDateFilter()
    setStartDate(null)
    setEndDate(null)
  }

  return manager.isSuperUser() ? (
    <div className='mr-bg-gradient-r-green-dark-blue mr-text-white mr-px-6 mr-py-8 mr-cards-inverse'>
      <MetricsHeader {...props} currentTab={currentTab} clearDate={clearDate}/>
      {<div className='mr-flex mr-justify-between mr-p-4 mr-pt-6'>
        <div>
          <div className='mr-flex mr-items-center'>
            <div className='mr-w-32'>
              <DatePicker selected={startDate} placeholderText={'Start date'} onChange={(date) => handleStartDate(date)} maxDate={endDate} />
            </div>
            <SvgSymbol
              viewBox='0 0 20 20'
              sym="arrow-right-icon"
              className="mr-fill-current mr-w-4 mr-h-4 mr-ml-2 mr-mr-2"
            />
            <div className='mr-w-32'>
              <DatePicker selected={endDate} placeholderText={'End date'} onChange={(date) => handleEndDate(date)} minDate={startDate} />
            </div>
            <button
              color='primary'
              type='button'
              className='mr-leading-none mr-button--dark mr-ml-4 mr-mr-1'
              onClick={() => {
                clearDate()
              }}>
          <FormattedMessage {...messages.clear} />
        </button>
          </div>
        </div>
        <div className='mr-flex mr-items-center'>
          {currentTab !== 'users' && <VisibleFilterToggle
            {...props}
            dashboardEntityFilters={props.entityFilters}
            toggleEntityFilter={props.toggleFilter}
            filterToggleLabel={<FormattedMessage {...messages.hideUndiscoverable} />}
          />}
          {currentTab !== 'users' && <ArchivedFilterToggle
            {...props}
            dashboardEntityFilters={props.entityFilters}
            toggleEntityFilter={props.toggleFilter}
            filterToggleLabel={<FormattedMessage {...messages.hideArchived} />}
          />}
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
        </div>
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
