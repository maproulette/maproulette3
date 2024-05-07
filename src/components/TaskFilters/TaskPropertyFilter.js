import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from '../Modal/Modal'
import External from '../External/External'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import _get from 'lodash/get'
import TaskPropertyQueryBuilder
       from '../TaskPropertyQueryBuilder/TaskPropertyQueryBuilder'
import TaskFilterIndicator from './TaskFilterIndicator'
import messages from './Messages'

/**
 * TaskPropertyFilter builds a dropdown for searching by task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPropertyFilter extends Component {
  state = {
    showForm: false
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
                <div className="mr-max-h-screen75">
                  {formSearch}
                </div>
              </Modal>
            </External>
          }
        </div>
      </div> 
    )
  }
}
