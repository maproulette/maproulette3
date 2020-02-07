import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Modal from '../Modal/Modal'
import SvgSymbol from '../SvgSymbol/SvgSymbol'

/**
 * Displays a basic modal dialog with title, prompt/message, icon and controls
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class BasicDialog extends Component {
  render() {
    return (
      <Modal
        isActive
        {...this.props.modalProps}
        fullBleed
        onClose={this.props.onClose}
      >
        <article>
          {this.props.icon &&
           <div className="mr-top-0 mr-absolute">
             <SvgSymbol
               className="mr-fill-white-04 mr-w-48 mr-h-48 mr-mt-4 mr-ml-8"
               viewBox='0 0 20 20'
               sym={this.props.icon}
             />
           </div>
          }
          <div className="mr-flex mr-flex-col mr-items-center mr-px-8 mr-pt-12">
            {this.props.icon &&
             <div className="mr-w-full mr-flex mr-justify-center mr-mb-4">
               <SvgSymbol
                 className={classNames("mr-h-10 mr-h-10", this.props.iconFill)}
                 viewBox='0 0 20 20'
                 sym={this.props.icon}
               />
             </div>
            }
            {this.props.title && 
             <div className="mr-text-3xl mr-mb-4 mr-text-grey-light">
               {this.props.title}
             </div>
            }
            {this.props.prompt &&
             <div className="mr-font-medium mr-text-grey-light">
               {this.props.prompt}
             </div>
            }
          </div>

          {this.props.controls ?
           <div className="mr-mt-16 mr-bg-blue-cloudburst mr-p-8 mr-flex mr-justify-center mr-items-center">
             {this.props.controls}
           </div> :
           <div className="mr-my-16" />
          }
        </article>
      </Modal>
    )
  }
}

BasicDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  prompt: PropTypes.node,
  icon: PropTypes.string,
  iconFill: PropTypes.string,
  controls: PropTypes.node,
}

BasicDialog.defaultProps = {
  iconFill: 'mr-fill-red',
}

export default BasicDialog
