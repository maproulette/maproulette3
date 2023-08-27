import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import classNames from 'classnames'
import messages from './Messages'

/**
 * QuickWidget makes creation of widgets easier by encapsulating the needed
 * structure for consistent display of common items (titles, header controls,
 * menu controls, scrollable content, etc).
 *
 * Note that the primary widget content should be provided as a child
 *
 * @see See Widgets/README.md for details on creating custom widgets
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class QuickWidget extends Component {
  constructor(props) {
    super(props)
    this.scrollRef = createRef()
    this.state = {
      error: false,
    }
  }

  componentDidCatch(error) {
    console.log(error)
    this.setState({error: true})
  }

  componentDidUpdate(prevProps){
    console.log(prevProps.taskId !== this.props.taskId)
    if(prevProps.taskId !== this.props.taskId){
      if (this.scrollRef.current) {
        this.scrollRef.current.scrollTop = 0;
      }
    }
  }

  render() {
    if (this.props.widgetHidden) {
      return null
    }

    if (this.state.error) {
      return (
        <div className="mr-text-lg mr-text-red-light mr-flex mr-justify-center mr-items-center">
          <FormattedMessage {...messages.widgetFailure} />
        </div>
      )
    }

    return (
      <section className={classNames("mr-flex mr-flex-col mr-h-full", this.props.className, {"mr-mb-4": this.props.isEditing})}>
        {this.props.isEditing && !this.props.permanent && !this.props.widgetPermanent &&
         <button
           className="mr-card-widget__delete"
           onClick={this.props.removeWidget}
         >
           Delete Widget
         </button>
        }

        <header className="mr-card-widget__header">
          <div className="mr-flex mr-items-center mr-justify-between">
            {this.props.widgetTitle &&
             <h2 className="mr-card-widget__title">{this.props.widgetTitle}</h2>
            }
            <div className="mr-widget__controls--left">
              {this.props.leftHeaderControls}
            </div>
            <div className="mr-widget__controls--center">
              {this.props.headerControls}
            </div>
            <div className="mr-widget__controls--right">
              {this.props.rightHeaderControls}
            </div>
          </div>
        </header>
        {this.props.noMain ?
          <div className="mr-card-widget__content">{this.props.children}</div> :
          <div className="mr-card-widget__main">
            {this.props.intro &&
            <div className="mr-card-widget__intro">{this.props.intro}</div>
            }
            <div ref={this.scrollRef} className="mr-card-widget__content">{this.props.children}</div>
          </div>
        }

      </section>
    )
  }
}

QuickWidget.propTypes = {
  /** Title of widget */
  widgetTitle: PropTypes.node,
  /** Optional controls to display in widget header next to the title */
  headerControls: PropTypes.element,
  /** Optional controls to display in widget drop-down menu */
  menuControls: PropTypes.element,
  /** Classnames to pass into Widget */
  className: PropTypes.string,  
}
