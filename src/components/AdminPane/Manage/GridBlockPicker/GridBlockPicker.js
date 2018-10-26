import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl } from 'react-intl'
import _map from 'lodash/map'
import _isObject from 'lodash/isObject'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import DropdownButton from '../../../Bulma/DropdownButton'
import messages from './Messages'
import './GridBlockPicker.css'

const DeactivatableDropdownButton = WithDeactivateOnOutsideClick(DropdownButton)

/**
 * GridBlockPicker renders a dropdown containing all registered block types
 * that are compatible with any data type targeted by the given dashboard.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class GridBlockPicker extends Component {
  blockSelected = ({key}) => {
    this.props.onBlockSelected(key)
  }

  render() {
    const menuOptions =
      _map(this.props.availableBlocks(), descriptor => ({
        key: descriptor.blockKey,
        text: _isObject(descriptor.label) ?
              this.props.intl.formatMessage(descriptor.label) :
              (descriptor.label || descriptor.blockKey),
      }))

    if (menuOptions.length === 0) {
      return null
    }

    return (
      <DeactivatableDropdownButton {...this.props}
                                   className="grid-block-picker"
                                   options={menuOptions}
                                   onSelect={this.blockSelected}>
        <a className="button is-rounded is-outlined is-secondary">
          <FormattedMessage {...messages.pickerLabel} />
          <div className="basic-dropdown-indicator" />
        </a>
      </DeactivatableDropdownButton>
    )
  }
}

GridBlockPicker.propTypes = {
  dashboard: PropTypes.object.isRequired,
  onBlockSelected: PropTypes.func.isRequired,
}

export default injectIntl(GridBlockPicker)
