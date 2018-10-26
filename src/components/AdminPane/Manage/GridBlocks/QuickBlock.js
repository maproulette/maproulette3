import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import WithDeactivateOnOutsideClick
       from '../../../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import SimpleDropdown from '../../../Bulma/SimpleDropdown'
import MenuControl from './MenuControl'
import MenuControlDivider from './MenuControlDivider'

const DeactivatableDropdown = WithDeactivateOnOutsideClick(SimpleDropdown)

/**
 * QuickBlock makes creation of dashboard blocks easier by encapsulating the
 * needed structure for consistent display of common items found in blocks
 * (titles, controls, scrollable content, etc).
 *
 * Note that the primary content should be provided as children.
 *
 * @see See GridBlocks/README.md for details on creating custom blocks.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class QuickBlock extends Component {
  render() {
    return (
      <div className={classNames("grid-block", this.props.className)}>
        <div className={classNames("grid-block__header",
                                   {"grid-block__header--has-header-content": !!this.props.headerContent})}>
          <div className="grid-block__header__title-row">
            <div className="grid-block__header__title-row__title">
              <h2 className="subtitle">{this.props.blockTitle}</h2>
            </div>

            {this.props.headerControls}

            <DeactivatableDropdown
                          className="grid-block__header__title-row__controls"
                          isRight
                          label={<SvgSymbol className="grid-block__header__title-row__controls__icon"
                                            sym="cog-icon" viewBox="0 0 20 20" />}>
              {this.props.menuControls &&
                <React.Fragment>
                  {this.props.menuControls}

                  <MenuControlDivider />
                </React.Fragment>
              }

              <MenuControl>
                <a className="is-danger" onClick={this.props.removeBlock}>Remove</a>
              </MenuControl>
            </DeactivatableDropdown>
          </div>

          {this.props.headerContent}
        </div>

        <div className="grid-block__content">
          {this.props.children}
        </div>
      </div>
    )
  }
}

QuickBlock.propTypes = {
  /** Title of block */
  blockTitle: PropTypes.node.isRequired,
  /** Optional controls to display in block header next to the title */
  headerControls: PropTypes.element,
  /** Optional controls to display in block drop-down menu */
  menuControls: PropTypes.element,
  /** Optional, additional content to display in block header */
  headerContent: PropTypes.element,
}
