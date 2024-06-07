import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import External from '../../External/External'
import Modal from '../../Modal/Modal'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import messages from './Messages'

/**
 * TaskPropertyFiltersModal provides a modal overlay and UI to enable use of task property filter rules
 * across workspace contexts. It consumes props from the WithSavedTaskPropertyFilters HOC to manage the setting
 * toggle state as well as the filter state, which is saved as a URL string.
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */

function TaskPropertyFiltersModal({managingSavedTaskPropertyFilterSettings, cancelManagingSavedTaskPropertyFilterSettings, savedTaskPropertyFilters}) {
  const history = useHistory()
  const currentSearchString = history.location.search
  const pathname = history.location.pathname

  const clearCurrentTaskPropertyFilters = () => {
    let currentParams = new URLSearchParams(currentSearchString)
    if(currentParams.has("filters.taskPropertySearch")) {
      currentParams.delete("filters.taskPropertySearch")
      const newSearchString = currentParams.toString()
      history.push({
        pathname,
        search: newSearchString,
        state: {refresh: true}
      })
    }
  }



  const filterClearButton = 
    <button 
      className="mr-flex mr-items-center mr-text-green-lighter mr-leading-loose hover:mr-text-white mr-transition-colors"
      onClick={clearCurrentTaskPropertyFilters}>
      <SvgSymbol sym="close-icon"
        viewBox='0 0 20 20'
        className="mr-fill-current mr-w-5 mr-h-5 mr-mr-1" />
      <FormattedMessage {...messages.clearFiltersLabel} />
  </button>

  const listSearches = _map(_keys(savedTaskPropertyFilters), (search, index) => {
    const taskPropertyURL = savedTaskPropertyFilters[search]
    const taskPropertyParams = new URLSearchParams(taskPropertyURL)
    const filterApplyButton = 
    <a 
      onClick={() => {
        // Clear current task property query parameter if present and set to value from saved filter, then update tasks.
        const currentSearchParams = new URLSearchParams(currentSearchString)
        if(currentSearchParams.has("filters.taskPropertySearch")) currentSearchParams.delete("filters.taskPropertySearch")
        const taskPropertySearchValue = taskPropertyParams.get("filters.taskPropertySearch")
        currentSearchParams.append("filters.taskPropertySearch", taskPropertySearchValue)
        const newSearchString = currentSearchParams.toString()
        console.log('currentSearchParams',currentSearchParams)
        console.log('taskPropertySearchValue', taskPropertySearchValue)
        console.log('newSearchString',newSearchString)

        history.push({
          pathname,
          search: newSearchString,
          state: {refresh: true}
        })
        cancelManagingSavedTaskPropertyFilterSettings()
      }}
      title={taskPropertyURL}>
      {search}
    </a>

    // Include only saved admin filters that have task property rules
    if(taskPropertyParams.has("filters.taskPropertySearch")) return (
      <li key={search + "-" + index}>
        <div className='mr-flex mr-space-x-2 mr-items-center'>
          <FilterListEntry applyButton={filterApplyButton}>{taskPropertyURL}</FilterListEntry>
        </div>
      </li>
    )
  })
  
  return (
    <React.Fragment>
      <External>
        <Modal 
          isActive={managingSavedTaskPropertyFilterSettings} 
          onClose={cancelManagingSavedTaskPropertyFilterSettings} 
          narrow
        >
          <div className='mr-space-y-4'>
            <div className='mr-max-w-sm'>  
              <h3 className="mr-text-yellow mr-mb-4">
                <FormattedMessage {...messages.taskPropertyFiltersModalTitle} />
              </h3>
              <div className='mr-space-y-3'>
                <p className='mr-text-base'>
                  <FormattedMessage {...messages.taskPropertyFiltersModalDescription} />
                </p>
                <p className='mr-text-sm mr-text-mango'>
                  <FormattedMessage {...messages.taskPropertyFiltersModalSubDescription} />
                </p>
                  {filterClearButton}
                </div>
            </div>
            <div className='mr-space-y-1 mr-p-4'>
              <ul>
                {savedTaskPropertyFilters ? listSearches : null}
              </ul>
            </div>
          </div>
          <button
            className="mr-button mr-col-span-2 mr-mt-8"
            onClick={cancelManagingSavedTaskPropertyFilterSettings}
          >
            <FormattedMessage {...messages.doneLabel} />
          </button>
        </Modal>
      </External>
    </React.Fragment>
  )
}

export default TaskPropertyFiltersModal

const FilterListEntry = ({applyButton, children}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <div className='mr-flex mr-space-x-1 mr-items-center'>
        {applyButton}
        <button onClick={() => setIsExpanded(prev => !prev)}>
          <SvgSymbol 
            sym='icon-cheveron-right' 
            viewBox="0 0 20 20"
            className={`mr-fill-current hover:mr-fill-green-light mr-w-5 mr-h-5 ${isExpanded ? 'mr-rotate-90' : ''}`} 
          />
        </button>
          
      </div>
      { isExpanded && 
        <div className='mr-bg-blue-firefly-75 mr-p-2'>
          {children}
        </div>
      }
    </div>
  )
}