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
        handleSaveCurrentRules={this.logCurrentRule}
        enableSavedRules
      />
    
    const currentTaskPropertyFilters = _get(this.props, 'criteria.filters.taskPropertySearch')
    const areTaskPropertyFiltersActive = currentTaskPropertyFilters ? Object.keys(currentTaskPropertyFilters).length > 0 : false

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
              <Modal isActive wide onClose={() => this.setState({showForm: false})}>
                <div className="mr-max-h-screen75 mr-space-y-4">
                  {formSearch}
                  <div className='mr-space-y-4'>
                    
                    <div className='mr-flex mr-space-x-1 mr-items-center'>
                      <button 
                        onClick={() => this.setState(prev => ({showSavedList: !prev.showSavedList}))} 
                        className=' hover:mr-text-white mr-flex mr-items-center mr-text-grey-light'
                      >
                        <span>Saved Property Filter Rules</span>
                        <SvgSymbol 
                          sym='icon-cheveron-right' 
                          viewBox="0 0 20 20"
                          className={`mr-fill-current  mr-w-5 mr-h-5 ${this.state.showSavedList ? 'mr-rotate-90' : ''}`} 
                        />
                      </button>  
                    </div>
                    {this.state.showSavedList && 
                      <div className='mr-bg-blue-firefly-75 mr-p-2'>
                        <p>Hello</p>
                        <button onClick={this.logCurrentRule}>Test Save</button>
                        <button onClick={() => console.log(this.props.user)}>Log Saved Rules</button>
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
