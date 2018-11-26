import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import wrapWithClickout from 'react-clickout'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

class Dropdown extends Component {
  state = {
    isVisible: false,
  }

  toggleVisible = () => {
    if (this.props.toggleVisible) {
      this.props.toggleVisible()
    }
    else {
      this.setState({isVisible: !this.state.isVisible})
    }
  }

  handleClickout() {
    if (this.props.close) {
      this.props.close()
    }
    else {
      this.setState({isVisible: false})
    }
  }

  render() {
    const isVisible =
      this.props.toggleVisible ? this.props.isVisible : this.state.isVisible

    return (
      <div className={classNames('mr-dropdown', this.props.className)}>
        <button className="mr-dropdown__button" onClick={this.toggleVisible}>
          {this.props.button}
        </button>

        {isVisible && (
          <div className="mr-dropdown__wrapper">
            <div className="mr-dropdown__main">
              <div className="mr-dropdown__inner">
                <SvgSymbol
                  sym="icon-triangle"
                  viewBox="0 0 15 10"
                  className="mr-dropdown__arrow"
                  aria-hidden
                />
                <div className="mr-dropdown__content">{this.props.children}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

Dropdown.propTypes = {
  className: PropTypes.string,
  button: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  toggleVisible: PropTypes.func,
  close: PropTypes.func,
}

export default wrapWithClickout(Dropdown)
