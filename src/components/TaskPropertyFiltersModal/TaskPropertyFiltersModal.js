import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import SavedTaskPropertyFilterRuleDisplayElement from './TaskPropertyFilterRuleDisplayElement'
import SavedTaskPropertyFilterListEntry from './SavedTaskPropertyFilterListEntry'
import External from '../External/External'
import Modal from '../Modal/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import {preparePropertyRulesForForm} from '../TaskPropertyQueryBuilder/TaskPropertyRules.js'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import messages from './Messages'

/**
 * TaskPropertyFiltersModal provides a modal overlay and UI to enable use of task property filter rules
 * across workspace contexts. It consumes props from the WithSavedTaskPropertyFilters HOC to manage the setting
 * toggle state as well as the filter state, which is saved as a URL string.
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */

function TaskPropertyFiltersModal({isOpen, closeModal, savedTaskPropertyFilters, challengeFilterIds}) {
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
  
  const savedFilterEntries = _map(_keys(savedTaskPropertyFilters), (search, index) => {
    const taskPropertyURL = savedTaskPropertyFilters[search]
    const taskPropertyParams = new URLSearchParams(taskPropertyURL)
    const taskPropertySearchValue = taskPropertyParams.get("filters.taskPropertySearch")

    const filterApplyButton = 
      <button
        className="hover:mr-text-green-lighter" 
        onClick={() => {
          // Clear current task property query parameter if present and set to value from saved filter, then update tasks.
          const currentSearchParams = new URLSearchParams(currentSearchString)
          if(currentSearchParams.has("filters.taskPropertySearch")) currentSearchParams.delete("filters.taskPropertySearch")
          currentSearchParams.append("filters.taskPropertySearch", taskPropertySearchValue)
          const newSearchString = currentSearchParams.toString()

          history.push({
            pathname,
            search: newSearchString,
            state: {refresh: true}
          })
        }}
      >
        {search}
      </button>

    const formattedRule = preparePropertyRulesForForm(JSON.parse(taskPropertySearchValue))
    
    return (
      <li key={search + "-" + index}>
        <div className='mr-flex mr-space-x-2 mr-items-center'>
          <SavedTaskPropertyFilterListEntry applyButton={filterApplyButton}>
            <SavedTaskPropertyFilterRuleDisplayElement formattedRule={formattedRule}/>
          </SavedTaskPropertyFilterListEntry>
        </div>
      </li>
    )
  })
  
  return (
    <React.Fragment>
      <External>
        <Modal 
          isActive={isOpen} 
          onClose={closeModal} 
          narrow
        >
          <div className='mr-space-y-4'>
            <h3 className="mr-text-yellow mr-mb-4">
              <FormattedMessage {...messages.taskPropertyFiltersModalTitle} />
            </h3>
            {challengeFilterIds.length === 1 && challengeFilterIds[0] > 0 ? (
            <div className='mr-max-w-sm'>  
              <div>
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
              <ul className='mr-p-4'>
                {savedTaskPropertyFilters ? savedFilterEntries : null}
              </ul>
              <button
                className="mr-button mr-col-span-2 mr-mt-8"
                onClick={closeModal}
              >
                <FormattedMessage {...messages.doneLabel} />
              </button>
            </div>
            ): (
              <div className='mr-text-mango mr-text-md'>
                <FormattedMessage {...messages.taskPropertyFiltersModalChallengeFilterRequirementAlertMessage} />
              </div>
            )}
          </div>
        </Modal>
      </External>
    </React.Fragment>
  )
}

export default TaskPropertyFiltersModal
