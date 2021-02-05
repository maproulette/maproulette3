import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import wrapWithClickout from 'react-clickout'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import { ExternalContext } from '../External/External'

class Dropdown extends Component {
  static contextType = ExternalContext

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
    if (!this.context.clickoutSuspended) {
      this.closeDropdown()
    }
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
      <div className={classNames('mr-dropdown', this.props.className)} {...this.props.rootProps}>
        {this.props.dropdownButton(renderFuncArgs)}
        {isDropdownVisible && (
          <div className={classNames("mr-dropdown__wrapper", this.props.wrapperClassName)}>
            <div className="mr-dropdown__main">
              <div className={classNames("mr-dropdown__inner", this.props.innerClassName, {"mr-fixed": this.props.fixedMenu})}>
                {!this.props.suppressControls &&
                 <SvgSymbol
                   sym="icon-triangle"
                   viewBox="0 0 15 10"
                   className={classNames("mr-dropdown__arrow", this.props.arrowClassName)}
                   aria-hidden
                 />
                }
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
