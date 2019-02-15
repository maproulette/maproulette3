import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import Dropdown from '../Dropdown/Dropdown'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './WidgetPicker.scss'

/**
 * WidgetPicker renders a dropdown containing the widgets provided by
 * the given availableWidgets function prop.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class WidgetPicker extends Component {
  widgetSelected = ({key}) => {
    this.props.onWidgetSelected(key)
  }

  render() {
    const menuItems =
      _map(this.props.availableWidgets(), descriptor => (
        <li key={descriptor.widgetKey}>
          <Link to={{}} onClick={() => this.props.onWidgetSelected(descriptor.widgetKey)}>
            {_isObject(descriptor.label) ?
             this.props.intl.formatMessage(descriptor.label) :
             (descriptor.label || descriptor.widgetKey)
            }
          </Link>
        </li>
      ))

    if (menuItems.length === 0) {
      return null
    }

    return (
      <Dropdown
        {...this.props}
        className="mr-dropdown mr-widget-picker mr-button mr-mr-4"
        dropdownButton={dropdown =>
          <PickerButton toggleDropdownVisible={dropdown.toggleDropdownVisible} />
        }
        dropdownContent={dropdown =>
          <ol className="mr-list-dropdown">
            {menuItems}
          </ol>
        }
      />
    )
  }
}

const PickerButton = function(props) {
  return (
    <button
      className="mr-dropdown__button"
      onClick={props.toggleDropdownVisible}
    >
      <span className="mr-flex">
        <span className="mr-mr-2">
          <FormattedMessage {...messages.pickerLabel} />
        </span>
        <SvgSymbol
          sym="icon-cheveron-down"
          viewBox="0 0 20 20"
          className="mr-fill-current mr-w-5 mr-h-5"
        />
      </span>
    </button>
  )
}

WidgetPicker.propTypes = {
  /** Returns widgets to be made available in picker */
  availableWidgets: PropTypes.func.isRequired,
  /** Invoked when a widget is selected by the user */
  onWidgetSelected: PropTypes.func.isRequired,
}

export default injectIntl(WidgetPicker)
