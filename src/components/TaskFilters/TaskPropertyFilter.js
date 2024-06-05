import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from '../Modal/Modal'
import External from '../External/External'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import _get from 'lodash/get'
import WithSavedTaskPropertyFilters from '../HOCs/WithSavedTaskPropertyFilters/WithSavedTaskPropertyFilters'
import TaskPropertyQueryBuilder
       from '../TaskPropertyQueryBuilder/TaskPropertyQueryBuilder'
import TaskFilterIndicator from './TaskFilterIndicator'
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

  logCurrentRule = (rule) => {
    console.log('task property rule', rule)
  }

  logSavedRuleUserSettings = () => {
    const rules = this.props.savedTaskPropertyFilters
    console.log(this.props.user.properties.mr3Frontend.settings)
    console.log(rules)
  }

  testSaveRule = () => {
    this.props.saveCurrentTaskPropertyFilters(this.props.criteria)
  }

  toggleSaveCurrentRules = () => {
    this.setState({savingCurrentRules: true})
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
        handleSaveCurrentRules={this.testSaveRule}
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
                        <ul>
                          <li>
                            <button onClick={this.logSavedRuleUserSettings}>Log Saved Rules</button>
                          </li>
                          {savedPropertyRules && Object.keys(savedPropertyRules).length ?
                            Object.keys(savedPropertyRules).map(ruleName => (
                              <li className="mr-flex mr-space-x-3 mr-items-center" key={`${ruleName} - ${savedPropertyRules[ruleName]}`}>
                                <button 
                                  className="hover:mr-text-green-lighter" 
                                  onClick={() => {
                                      const {pathname, search} = this.props.history.location
                                      const savedRuleParam = new URLSearchParams(savedPropertyRules[ruleName])
                                      const params = new URLSearchParams(search)
                                      const savedRuleValue = savedRuleParam.get("filters.taskPropertySearch")
                                      if(params.has("filters.taskPropertySearch")) params.delete("filters.taskPropertySearch")
                                      params.append("filters.taskPropertySearch", savedRuleValue)
                                      const newSearchString = params.toString()
                                      this.props.history.push({
                                        pathname,
                                        search: newSearchString,
                                        state: {refresh: true}
                                      })
                                    }
                                  }
                                >
                                  {ruleName}
                                </button>
                                <button 
                                  className='hover:mr-text-green-lighter mr-text-xs'
                                  onClick={() => this.props.removeSelectedPropertyFilter(ruleName)}
                                >
                                  delete
                                </button>
                              </li>
                            )) : null
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
