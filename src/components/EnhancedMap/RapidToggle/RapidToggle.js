import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _map from 'lodash/map'
import SvgSymbol from '../../SvgSymbol/SvgSymbol'
import Dropdown from '../../Dropdown/Dropdown'

/**
 * RapidToggle presents a control for selecting the desired map layer/tiles.
 * The required `changeLayer` prop function will be invoked with the new layer
 * name whenever the user selects a new layer.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class RapidToggle extends Component {
  render() {

    const handleClick = () => {
      alert('Note: this is a new feature that we are still testing.');
    };

    const options = ['Classic mode', 'Edit Mode'];

    const optionToggleItems = _map(options, (option, index) => (
      <li key={index}>
        <button
         
          onClick={handleClick}
        >
        {option}
        </button>
      </li>
    ))
    
    return (
      <Dropdown
        className="mr-dropdown--right mr-absolute mr-z-10 mr-right-0 mr-top-0 mr-mr-12 mr-mt-2"
        dropdownButton={dropdown =>
          <button onClick={dropdown.toggleDropdownVisible} className="mr-leading-none mr-p-2 mr-bg-black-50 mr-text-white mr-w-8 mr-h-8 mr-flex mr-items-center mr-shadow mr-rounded-sm mr-transition-normal-in-out-quad hover:mr-text-green-lighter" aria-haspopup="true"
          aria-controls="dropdown-menu">
            <SvgSymbol sym="flag-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" />
          </button>
        }
        dropdownContent={() =>
          <React.Fragment>
            {<ol className="mr-o-2">{optionToggleItems}</ol>}
            {<hr className="mr-h-px mr-my-4 mr-bg-white-15" />}
          </React.Fragment>
        }
      />
    )
  }
}

RapidToggle.propTypes = {
  /** Array of layer sources to present as options */
  layerSources: PropTypes.array.isRequired,
  /** Invoked when the user chooses a new layer source */
  changeLayer: PropTypes.func.isRequired,
  /** Set to true if task features are shown on the map */
  showTaskFeatures: PropTypes.bool,
  /** Invoked when the user toggles visibility of task features */
  toggleTaskFeatures: PropTypes.func,
  /** Set to true if Mapillary layer is to be shown on the map */
  showMapillary: PropTypes.bool,
  /** Set to the number of Mapillary markers available in layer */
  mapillaryCount: PropTypes.number,
  /** Invoked when the user toggles visibility of Mapillary layer */
  toggleMapillary: PropTypes.func,
}

export default RapidToggle;