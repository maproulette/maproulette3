import React, { Component } from 'react'
import _map from 'lodash/map'
import { FormattedMessage } from 'react-intl'
import WithNominatimSearch from '../../HOCs/WithNominatimSearch/WithNominatimSearch'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import Dropdown from '../../Dropdown/Dropdown'
import messages from './Messages'

/**
 * SearchControl presents a map control that can be used to execute geographic
 * searches via Nominatim (name searches, lon/lat searches, etc.)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class SearchControl extends Component {
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
      <Dropdown
        className="mr-dropdown--right mr-absolute mr-z-5 mr-pin-r mr-pin-t mr-mr-2 mr-mt-41"
        dropdownButton={dropdown =>
          <button
            onClick={dropdown.toggleDropdownVisible}
            className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
          >
            <SvgSymbol sym="search-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
          </button>
        }
        dropdownContent={dropdown =>
          <div className="mr-min-w-102">
            <div className="mr-flex mr-justify-between mr-items-center">
              <div className="mr-flex mr-items-center">
                <input
                  className="mr-input mr-input--green-lighter-outline"
                  type="text"
                  placeholder={this.props.intl.formatMessage(messages.nominatimQuery)}
                  value={this.props.nominatimQuery}
                  onChange={(e) => this.props.updateNominatimQuery(e.target.value)}
                />
                <button
                  className="mr-button mr-h-10 mr-py-0 mr-ml-4"
                  onClick={this.props.searchNominatim}
                >
                  <FormattedMessage {...messages.searchLabel } />
                </button>
              </div>
              <button
                className="mr-ml-4"
                onClick={() => {
                  dropdown.closeDropdown()
                  this.props.clearNominatimSearch()
                }}
              >
                <SvgSymbol
                  sym="icon-close"
                  viewBox="0 0 20 20"
                  className="mr-fill-white mr-w-4 mr-h-4"
                  aria-hidden
                />
              </button>
            </div>

            {this.props.nominatimResults &&
             <React.Fragment>
               <hr className="mr-h-px mr-my-4 mr-bg-blue" />
               {resultItems.length === 0 ? <FormattedMessage {...messages.noResults } /> :
                <ol className="mr-o-2" onClick={() => dropdown.closeDropdown()}>
                  {resultItems}
                </ol>
               }
             </React.Fragment>
            }
          </div>
        }
      />
    )
  }
}

export default WithNominatimSearch(SearchControl)
