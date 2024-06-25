import React, { Component, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from '../Modal/Modal'
import External from '../External/External'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import _get from 'lodash/get'
import { preparePropertyRulesForForm } from '../TaskPropertyQueryBuilder/TaskPropertyRules'
import WithSavedTaskPropertyFilters from '../HOCs/WithSavedTaskPropertyFilters/WithSavedTaskPropertyFilters'
import TaskPropertyQueryBuilder
       from '../TaskPropertyQueryBuilder/TaskPropertyQueryBuilder'
import TaskFilterIndicator from './TaskFilterIndicator'
import SavedTaskPropertyFilterListEntry from '../TaskPropertyFiltersModal/SavedTaskPropertyFilterListEntry'
import SavedTaskPropertyFilterRuleDisplayElement from '../TaskPropertyFiltersModal/TaskPropertyFilterRuleDisplayElement'
import messages from './Messages'

/**
 * TaskPropertyFilter builds a dropdown for searching by task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskPropertyFilter extends Component {
  state = {
    showForm: false,
    showSavedList: false,
  }

  saveCurrentTaskPropertyFilterRules = () => {
    this.props.saveCurrentTaskPropertyFilters(this.props.criteria)
  }

  render() {
    const formSearch =
      <TaskPropertyQueryBuilder
        {...this.props}
        taskPropertyQuery={_get(this.props, 'criteria.filters.taskPropertySearch')}
        clearTaskPropertyQuery={this.props.clearTaskPropertyCriteria}
        updateTaskPropertyQuery={(data) => {
          this.setState({showForm: false})
          this.props.updateTaskPropertyCriteria(data)
        }}
        handleSaveCurrentRules={this.saveCurrentTaskPropertyFilterRules}
        enableSavedRules
      />
    
    const currentTaskPropertyFilters = _get(this.props, 'criteria.filters.taskPropertySearch')
    const areTaskPropertyFiltersActive = currentTaskPropertyFilters ? Object.keys(currentTaskPropertyFilters).length > 0 : false
    const savedPropertyRules = this.props.savedTaskPropertyFilters

    return (
      <div className='mr-flex mr-space-x-1 mr-items-center'>
        {areTaskPropertyFiltersActive && <TaskFilterIndicator />}
        <div className="mr-dropdown mr-dropdown--right">
          <button className="mr-flex mr-items-center mr-text-mango"
                  onClick={() => this.setState({showForm: !this.state.showForm})}>
            <span className="mr-text-base mr-uppercase mr-mr-1">
              <span><FormattedMessage {...messages.filterByPropertyLabel} /></span>
            </span>
            <SvgSymbol
              sym="icon-cheveron-down"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5"
            />
          </button>
          {this.state.showForm && 
            <External>
              <Modal isActive wide onClose={() => this.setState({showForm: false, showSavedList: false})}>
                <div className="mr-max-h-screen75 mr-space-y-4">
                  {formSearch}
                  <div className='mr-space-y-4'>
                    
                    <div className='mr-flex mr-space-x-1 mr-items-center'>
                      <button 
                        onClick={() => this.setState(prev => ({showSavedList: !prev.showSavedList}))} 
                        className=' hover:mr-text-green-lighter mr-flex mr-items-center mr-text-white'
                      >
                        <span><FormattedMessage {...messages.savedTaskPropertyListToggleLabel} /></span>
                        <SvgSymbol 
                          sym='icon-cheveron-right' 
                          viewBox="0 0 20 20"
                          className={`mr-fill-current  mr-w-5 mr-h-5 ${this.state.showSavedList ? 'mr-rotate-90' : ''}`} 
                        />
                      </button>  
                    </div>
                    {this.state.showSavedList && 
                      <div className='mr-bg-blue-firefly-75 mr-p-2'>
                        <ul className='mr-w-full mr-pb-4'>
                          {savedPropertyRules && Object.keys(savedPropertyRules).length ?
                            Object.keys(savedPropertyRules).map(ruleName => {
                              const savedRuleParam = new URLSearchParams(savedPropertyRules[ruleName])
                              const savedRuleValue = savedRuleParam.get("filters.taskPropertySearch")
                              const formattedRule = preparePropertyRulesForForm(JSON.parse(savedRuleValue))

                              const filterApplyButton = 
                                <button
                                  className="hover:mr-text-green-lighter" 
                                  onClick={() => {
                                    this.props.updateTaskPropertyCriteria(JSON.parse(savedRuleValue))
                                  }}
                                 >
                                  {ruleName}
                                </button>
                                
                              return (
                                <li className="mr-flex mr-items-center mr-w-full" key={`${ruleName} - ${savedPropertyRules[ruleName]}`}>
                                  <SavedTaskPropertyFilterListEntry applyButton={filterApplyButton}>
                                    <SavedTaskPropertyFilterRuleDisplayElement formattedRule={formattedRule}/>
                                  </SavedTaskPropertyFilterListEntry>
                                  <button 
                                    className='mr-text-green-lighter hover:mr-text-white mr-text-sm mr-ml-auto'
                                    onClick={() => this.props.removeSelectedPropertyFilter(ruleName)}
                                  >
                                    delete
                                  </button>
                                </li>
                              )}
                            ) : null
                          }
                        </ul>
                      </div>
                    }
                  </div>
                </div>
              </Modal>
            </External>
          }
        </div>
      </div> 
    )
  }
}

export default WithSavedTaskPropertyFilters(TaskPropertyFilter)
