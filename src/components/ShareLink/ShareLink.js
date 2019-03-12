import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FormattedMessage } from 'react-intl'
import WithDeactivateOnOutsideClick
       from '../HOCs/WithDeactivateOnOutsideClick/WithDeactivateOnOutsideClick'
import SvgSymbol from '../SvgSymbol/SvgSymbol'
import messages from './Messages'
import './ShareLink.scss'

/**
 * ShareLink presents a link icon that toggles a small Bulma dropdown
 * presenting the given share link (made into an absolute URL using the
 * REACT_APP_URL .env variable) with an option to copy the link to the user's
 * clipboard.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ShareLink extends Component {
  render() {
    const absoluteLink = `${process.env.REACT_APP_URL}${this.props.link}`

    return (
      <div className={classNames('share-link dropdown', {'is-active': this.props.isActive},
                                 this.props.className)}>
        <button className='mr-text-white hover:mr-text-green-lighter' onClick={this.props.toggleActive}>
          <SvgSymbol
            viewBox="0 0 20 14"
            sym="link-icon"
            className="mr-fill-current mr-w-5 mr-h-auto"
          />
        </button>

        {this.props.isActive &&
         <div className='menu-wrapper'>
           <div className='dropdown-menu' role='menu'>
             <div className='mr--mt-2 mr-flex mr-items-center mr-justify-between mr-p-2 mr-bg-blue-dark mr-text-white mr-rounded mr-shadow mr-text-sm'>
               <span className="share-link__text">{absoluteLink}</span>

               <CopyToClipboard text={absoluteLink} onCopy={this.props.deactivate}>
                 <button className="mr-button mr-button--small mr-ml-2 mr-flex mr-items-center">
                   <FormattedMessage {...messages.copy} />
                   <SvgSymbol viewBox='0 0 20 20' className="mr-ml-2 mr-w-3 mr-h-3 mr-fill-current" sym="clipboard-icon" />
                 </button>
               </CopyToClipboard>
             </div>
           </div>
         </div>
        }
      </div>
    )
  }
}

ShareLink.propTypes = {
  /**
   * Relative link to be shared. The link will be made absolute using
   * REACT_APP_URL .env variable.
   */
  link: PropTypes.string.isRequired,
}

export default WithDeactivateOnOutsideClick(ShareLink)
