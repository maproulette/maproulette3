import React, {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import classNames from 'classnames'
import External from '../../External/External'
import Modal from '../../Modal/Modal'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import {preparePropertyRulesForForm} from '../../TaskPropertyQueryBuilder/TaskPropertyRules.js'
import _map from 'lodash/map'
import _keys from 'lodash/keys'
import messages from './Messages'

/**
 * TaskPropertyFiltersModal provides a modal overlay and UI to enable use of task property filter rules
 * across workspace contexts. It consumes props from the WithSavedTaskPropertyFilters HOC to manage the setting
 * toggle state as well as the filter state, which is saved as a URL string.
 * @author [Andrew Philbin](https://github.com/AndrewPhilbin)
 */

function TaskPropertyFiltersModal({isOpen, closeModal, savedTaskPropertyFilters}) {
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
  
  /**
   * @param rule
   * @param operationType
   * @param isChildTier
   * 
   * Outputs the JSX necessary to render a task property rule as readable text. Any hierarchy (compound rules)
   * will be indented as appropriate. The rule must be formatted properly by the preparePropertyRulesForForm
   * function. Compound rule JSX is built recursively and any multi-value rules will have values displayed as
   * comma separated.
   */
  const renderTaskPropertyRuleForDisplay = (rule, operationType = null, isChildTier = false) => {
    if(rule.key && rule.operator) {
      if(rule.value && rule.value.length > 1) {
        return (
          <div className="mr-flex mr-space-x-1">
            <span className="mr-bg-mango-30 mr-px-1 mr-rounded">{rule.key}</span>
            <span>{rule.operator}</span>
            <div className="mr-flex mr-space-x-1 mr-bg-blue-light-75 mr-px-1 mr-rounded-sm">
              {rule.value.map((val, i) => {
                return <span key={`${rule.value} ${i}`}>{i === rule.value.length - 1 ? val : `${val}, `}</span>
              })}
            </div>
          </div>
        )
      }
      return (
        <div className="mr-flex mr-space-x-1">
          <span className="mr-bg-mango-30 mr-px-1">{rule.key}</span>
          <span>{rule.operator}</span>
          {rule.value && rule.value.length > 0 && rule.value[0].length > 0 && 
            <span className="mr-bg-blue-light-75 mr-px-1">{rule.value[0]}</span>
          }
          {operationType && <span>{operationType}</span>}
        </div>
      )
    }

    if(!rule.key && rule.left && rule.right) {
      if(rule.left.key && rule.right.key) {
        return (
          <div className={`mr-flex mr-space-x-1 ${isChildTier ? "mr-pl-4" : ""}`}>
            <span>
              {renderTaskPropertyRuleForDisplay(rule.left, rule.operator)}
            </span>
            <span>{rule.condition}</span>
            <span>
              {renderTaskPropertyRuleForDisplay(rule.right)}
            </span>
          </div>
        )
      } else if(!rule.left.key || !rule.right.key) {
          return (
            <div>
              <div className={classNames({
                "mr-pl-4" : !rule.left.key && !rule.left.valueType === "compound rule",
                "mr-flex mr-space-x-1" : rule.right.valueType === "compound rule"
              })}>
                {renderTaskPropertyRuleForDisplay(rule.left, rule.operator)}
                {rule.right.valueType === "compound rule" && <span>{rule.condition}</span>}
              </div>
              <div className="mr-pl-4">
                {renderTaskPropertyRuleForDisplay(rule.right, rule.operator, isChildTier)}
              </div>
            </div>
          )
      }
    }
    return (
      <div>
        {renderTaskPropertyRuleForDisplay(rule)}
      </div>
    )
  }


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
          // cancelManagingSavedTaskPropertyFilterSettings()
        }}
        title={taskPropertyURL}>
        {search}
      </button>

    // Include only saved admin filters that have task property rules
    if(taskPropertyParams.has("filters.taskPropertySearch")) {
      const formattedRule = preparePropertyRulesForForm(JSON.parse(taskPropertySearchValue))
      const renderedPropertyRule = renderTaskPropertyRuleForDisplay(formattedRule)
      
      return (
        <li key={search + "-" + index}>
          <div className='mr-flex mr-space-x-2 mr-items-center'>
            <FilterListEntry applyButton={filterApplyButton}>{renderedPropertyRule}</FilterListEntry>
          </div>
        </li>
      )
    } 
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
                {savedTaskPropertyFilters ? savedFilterEntries : null}
              </ul>
            </div>
          </div>
          <button
            className="mr-button mr-col-span-2 mr-mt-8"
            onClick={closeModal}
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