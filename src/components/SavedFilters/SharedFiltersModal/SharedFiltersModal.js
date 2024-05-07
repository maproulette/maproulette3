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
 * SharedFiltersModal provides a modal overlay and UI to enable use of task and other filter settings
 * across workspace contexts. It consumes props from the WithSavedFilters HOC to manage the setting
 * toggle state as well as the filter state, which is saved as a URL string. URL filter strings are 
 * currently consumed by the challenge "Create and Manage" view as well as the Task Review tables.
 * Filter sharing enabled via this modal will function in both of those workspace contexts.
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */



function SharedFiltersModal({managingSharedFilterSettings, cancelManagingSharedFilterSettings, ...props}) {
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

  const listSearches = _map(_keys(props.challengeAdminFilters), (search, index) => {
    const adminSearchURL = props.challengeAdminFilters[search]
    const adminParams = new URLSearchParams(adminSearchURL)
    const filterApplyButton = 
    <a 
      onClick={() => {
        let currentSearchParams = new URLSearchParams(currentSearchString)
        if(currentSearchParams.has("filters.taskPropertySearch")) currentSearchParams.delete("filters.taskPropertySearch")
        const taskPropertySearchValue = adminParams.get("filters.taskPropertySearch")
        currentSearchParams.append("filters.taskPropertySearch", taskPropertySearchValue)
        const newSearchString = currentSearchParams.toString()
        history.push({
          pathname,
          search: newSearchString,
          state: {refresh: true}
        })
        cancelManagingSharedFilterSettings()
      }}
      title={adminSearchURL}>
      {search}
    </a>

    if(adminParams.has("filters.taskPropertySearch")) return (
      <li key={search + "-" + index}>
        <div className='mr-flex mr-space-x-2 mr-items-center'>
          <FilterListEntry applyButton={filterApplyButton}>{adminSearchURL}</FilterListEntry>
        </div>
      </li>
    )
  })
  
  return (
    <React.Fragment>
      <External>
        <Modal 
          isActive={managingSharedFilterSettings} 
          onClose={cancelManagingSharedFilterSettings} 
          narrow
        >
          <div className='mr-space-y-4'>
            <div className='mr-max-w-sm'>  
              <h3 className="mr-text-yellow mr-mb-4">
                <FormattedMessage {...messages.sharedFiltersModalTitle} />
              </h3>
              <div className='mr-space-y-3'>
                <p className='mr-text-base'>
                  <FormattedMessage {...messages.sharedFiltersModalDescription} />
                </p>
                <p className='mr-text-sm mr-text-mango'>
                  <FormattedMessage {...messages.sharedFiltersModalSubDescription} />
                </p>
                  {filterClearButton}
                </div>
            </div>
            <div className='mr-space-y-1 mr-p-4'>
              <ul>
                {listSearches}
              </ul>
            </div>
          </div>
          <button
            className="mr-button mr-col-span-2 mr-mt-8"
            onClick={cancelManagingSharedFilterSettings}
          >
            <FormattedMessage {...messages.doneLabel} />
          </button>
        </Modal>
      </External>
    </React.Fragment>
  )
}

export default SharedFiltersModal

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