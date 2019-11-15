import React, { Component } from 'react'
import _map from 'lodash/map'
import { FormattedMessage } from 'react-intl'
import WithNominatimSearch from '../../HOCs/WithNominatimSearch/WithNominatimSearch'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import Dropdown from '../../Dropdown/Dropdown'
import messages from './Messages'

/**
 * Location SearchBox presents a map search box that can be used to execute
 * geographic searches via Nominatim (name searches, lon/lat searches, etc.)
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class LocationSearchBox extends Component {
  state = {
    showDropdown: false
  }

  render() {
    const resultItems = _map(this.props.nominatimResults, result => (
      <li key={result.osmId}>
        <button
          className='mr-text-current hover:mr-text-yellow'
          onClick={() => this.props.chooseNominatimResult(result)}
        >
          {result.name}
        </button>
      </li>
    ))

    return (
      <div className="mr-dropdown--right mr-inline-block">
        <div className="">
          <div className="mr-flex mr-justify-between mr-items-center">
            <div className="mr-flex mr-items-center mr-text-sm">
              <input
                className="mr-input mr-py-1 mr-leading-normal mr-border-none"
                type="text"
                placeholder="Location"
                value={this.props.nominatimQuery}
                onChange={(e) => this.props.updateNominatimQuery(e.target.value)}
              />
              <button
                className="mr-button mr-button--small mr-button--blue-fill mr-ml-2"
                onClick={() => {
                  this.props.searchNominatim()
                  this.setState({showDropdown: true})
                }}
              >
                <FormattedMessage {...messages.searchLabel } />
              </button>
            </div>
          </div>

          {this.props.nominatimResults && this.state.showDropdown &&
            <Dropdown
              className="mr-flex"
              arrowClassName="mr-pr-5"
              toggleVisible
              isVisible
              dropdownButton={() => null}
              dropdownContent={dropdown =>
               <React.Fragment>
                 <div className="mr-text-right">
                   <button
                     className="mr-pin-t mr-pin-r mr-transition mr-text-green-lighter hover:mr-text-white"
                     onClick={() => {
                       this.props.clearNominatimSearch()
                       this.setState({showDropdown: false})
                     }}
                   >
                     <SvgSymbol
                       sym="close-outline-icon"
                       viewBox="0 0 20 20"
                       className="mr-fill-current mr-w-5 mr-h-5"
                     />
                   </button>
                 </div>
                 {resultItems.length === 0 ? <FormattedMessage {...messages.noResults } /> :
                  <ol className="mr-o-2" onClick={() => this.setState({showDropdown: false})}>
                    {resultItems}
                  </ol>
                 }
               </React.Fragment>
             }
            />
          }
        </div>
      </div>
    )
  }
}

export default WithNominatimSearch(LocationSearchBox)
