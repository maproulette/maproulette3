import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'
import SearchBox from '../SearchBox/SearchBox'
import messages from './Messages'
import SortChallengesSelector from '../ChallengePane/ChallengeFilterSubnav/SortChallengesSelector'
import FilterByDifficulty from '../ChallengePane/ChallengeFilterSubnav/FilterByDifficulty'
import FilterByKeyword from '../ChallengePane/ChallengeFilterSubnav/FilterByKeyword'
import SortProjectsSelector from './SortProjectsSelector'
import DatePicker from "react-datepicker";
import { useState } from 'react'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

const MetricsHeader = (props) => {

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

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

  const handleTabToggle = (val) => {
    props.clearSearchFilters()
    props.clearSearch()
    const searchQuery = `?tab=${val}&searchType=${val}`
    props.history.push({
      pathname: '/superadmin',
      search: searchQuery
    })
    props.setSearchSort({sortBy: 'default'})
  }

  return (
    <header className='mr-bg-black-10 mr-shadow mr-py-4 lg:mr-py-0 mr-px-6 mr-hidden lg:mr-flex mr-items-center mr-justify-between'>
      <div className='mr-flex-grow mr-flex mr-items-center mr-justify-between lg:mr-justify-start'>
        <h1 className='mr-hidden xl:mr-flex mr-text-3xl mr-leading-tight mr-font-normal mr-mr-6'>
          <FormattedMessage {...messages.header} />
        </h1>
        <div className={'mr-flex mr-items-center '}>
          <div className='admin__manage__controls mr-flex'>
            <button
              className='mr-button mr-button--dark mr-button--small mr-mr-4'
              onClick={() => handleTabToggle('challenges')}
            >
              <FormattedMessage {...messages.challengeLabel} />
            </button>
            <button
              className='mr-button mr-button--dark mr-button--small mr-mr-4'
              onClick={() => handleTabToggle('projects')}
            >
              <FormattedMessage {...messages.projectLabel} />
            </button>
          </div>
          {props.currentTab === 'challenges' && <>
            <SortChallengesSelector {...props} />
            <FilterByKeyword {...props} />
            <FilterByDifficulty {...props} />
          </>}
          {props.currentTab === 'projects' && <>
            <SortProjectsSelector {...props}/>
          </>}
          <div>
            <span className="mr-block mr-text-left mr-mb-1 mr-text-xs mr-uppercase mr-text-white">
              Date Range
            </span>
            <div className='mr-flex mr-items-center'>
            <DatePicker selected={startDate} onChange={(date) => handleStartDate(date)} maxDate={endDate}/>
            <SvgSymbol
              viewBox='0 0 20 20'
              sym="arrow-right-icon"
              className="mr-fill-current mr-w-4 mr-h-4 mr-ml-2 mr-mr-2"
            />
            <DatePicker selected={endDate} onChange={(date) => handleEndDate(date)} minDate={startDate}/>
            </div>
          </div>
          <SearchBox 
            {...props}
            setSearch={props.setSearch}
        
            />
        </div>
      </div>
    </header>
  )
}

export default injectIntl(MetricsHeader)
