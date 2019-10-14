import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import FilterDropdown from './FilterDropdown'
import _map from 'lodash/map'
import messages from './Messages'


/**
 * TaskPropertyFilter builds a dropdown for searching by task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class TaskPropertyFilter extends Component {
  state = {
  }

  render() {
    return (
      <FilterDropdown
        title={<FormattedMessage {...messages.filterByPropertyLabel} />}
        filters={
          <li key="property">
            <label className="mr-flex mr-items-center">
              <select onChange={e => {
                        this.setState({propertySelect: e.target.value})
                        if (e.target.value === "") {
                          this.props.clearTaskPropertyCriteria()
                        }
                      }}
                      defaultValue={this.state.propertySelect || ""}
                      className="select mr-min-w-20 mr-bg-grey-lighter mr-rounded mr-px-1 mr-text-xs mr-pl-2">
                <option key="none" value="">
                  None
                </option>
                {_map(this.props.taskPropertyKeys, (value) =>
                  <option key={value} value={value}>{value}</option>
                )}
              </select>
              {this.state.propertySelect && this.state.propertySelect !== "" &&
                <div>
                  <label className="mr-pr-2 mr-pl-2"> = </label>
                  <input className="mr-mr-2"
                    type="text"
                    defaultValue={this.state.propertyValue}
                    onChange={e => {this.setState({propertyValue: e.target.value})}} />
                  <button className="mr-button mr-button--small"
                    onClick={() => {
                      this.props.updateTaskPropertyCriteria(this.state.propertySelect, this.state.propertyValue)
                    }}>
                    Search
                  </button>
                </div>
              }
            </label>
          </li>
        }
      />
    )
  }
}
