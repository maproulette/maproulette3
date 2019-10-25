import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import _map from 'lodash/map'
import { TaskPropertySearchType, messagesByPropertySearchType }
       from '../../services/Task/TaskProperty/TaskProperty'
import messages from './Messages'


/**
 * TaskPropertyFilter builds a dropdown for searching by task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPropertyFilter extends Component {
  state = {
    searchType: TaskPropertySearchType.equals,
  }

  render() {
    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByPropertyLabel} />}
        filters={
          <li key="property">
            <div className="mr-flex mr-items-center">
              <div className="form-select">
                <select onChange={e => {
                    this.setState({propertySelect: e.target.value})
                    if (e.target.value === "") {
                      this.props.clearTaskPropertyCriteria()
                    }
                  }}
                  defaultValue={this.state.propertySelect || ""}
                  className="select form-control mr-min-w-36">
                    <option key="none" value="">
                      {this.props.intl.formatMessage(messages.noneOption)}
                    </option>
                    {_map(this.props.taskPropertyKeys, (value) =>
                      <option key={value} value={value}>{value}</option>
                    )}
                </select>
                <div className="mr-pointer-events-none mr-absolute mr-pin-y mr-pin-r mr-flex mr-items-center mr-px-2 mr-text-grey">
                  <SvgSymbol
                    sym="icon-cheveron-down"
                    viewBox="0 0 20 20"
                    className="mr-fill-current mr-w-4 mr-h-4"
                  />
                </div>
              </div>
              {this.state.propertySelect && this.state.propertySelect !== "" &&
                <React.Fragment>
                  <div className="form-select mr-pr-2 mr-pl-2 mr-w-40">
                    <select className="select form-control"
                        onChange={e => {
                          this.setState({searchType: e.target.value})
                        }}
                        defaultValue={this.state.searchType}>
                    {
                      _map(TaskPropertySearchType, searchType => (
                          <option key={searchType} value={searchType}>
                            {this.props.intl.formatMessage(messagesByPropertySearchType[searchType])}
                          </option>
                        )
                      )
                    }
                    </select>
                    <div className="mr-pointer-events-none mr-absolute mr-pin-y mr-pin-r mr-flex mr-items-center mr-px-2 mr-text-grey">
                      <SvgSymbol
                        sym="icon-cheveron-down"
                        viewBox="0 0 20 20"
                        className="mr-fill-current mr-w-4 mr-h-4"
                      />
                    </div>
                  </div>
                  <input className="mr-mr-2 mr-h-9"
                    type="text"
                    defaultValue={this.state.propertyValue}
                    onChange={e => {this.setState({propertyValue: e.target.value})}} />
                  <button className="mr-button mr-button--small"
                    onClick={() => {
                      this.props.updateTaskPropertyCriteria(
                        this.state.propertySelect,
                        this.state.propertyValue,
                        this.state.searchType)
                    }}>
                    <FormattedMessage {...messages.searchButton} />
                  </button>
                </React.Fragment>
              }
            </div>
          </li>
        }
      />
    )
  }
}
