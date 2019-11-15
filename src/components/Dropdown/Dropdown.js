import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import wrapWithClickout from 'react-clickout'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

class Dropdown extends Component {
  state = {
    isVisible: false,
  }

  toggleDropdownVisible = () => {
    this.setState({isVisible: !this.state.isVisible})
  }

  closeDropdown = () => {
    this.setState({isVisible: false})
  }

  handleClickout() {
    this.closeDropdown()
  }

  render() {
    const isDropdownVisible =
      this.props.toggleVisible ? this.props.isVisible : this.state.isVisible

    const renderFuncArgs = {
      isDropdownVisible,
      toggleDropdownVisible: this.toggleDropdownVisible,
      closeDropdown: this.closeDropdown
    }

    return (
      <div className={classNames('mr-dropdown', this.props.className)}>
        {this.props.dropdownButton(renderFuncArgs)}
        {isDropdownVisible && (
          <div className="mr-dropdown__wrapper">
            <div className="mr-dropdown__main">
              <div className="mr-dropdown__inner">
                <SvgSymbol
                  sym="icon-triangle"
                  viewBox="0 0 15 10"
                  className={classNames("mr-dropdown__arrow", this.props.arrowClassName)}
                  aria-hidden
                />
                <div className="mr-dropdown__content">
                  {this.props.dropdownContent(renderFuncArgs)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

Dropdown.propTypes = {
  dropdownButton: PropTypes.func.isRequired,
  dropdownContent: PropTypes.func.isRequired,
}

export default wrapWithClickout(Dropdown)
