import React, { Component } from 'react'
import Button from '../../../Button/Button'
import SvgSymbol from '../../../SvgSymbol/SvgSymbol'
import { FormattedMessage} from 'react-intl'
import messages from "./Messages";

/**
 * NotificationCards renders a simple button to notify
 * the user of the new editMode option (in RapidMode)
 *
 * @author [Matthew Espinoza](https://github.com/mattespoz)
 */
export class NotificationCard extends Component {
  state = {
    tooltipShow: this.props.getUserAppSetting(this.props.user, 'tooltipShow') || true,
  }

  handleClick = () => {
    this.setState({
        tooltipShow: false,
    });
    this.props.updateUserAppSetting(this.props.user.id, {
        tooltipShow: false,
    });
  }


  render() {
    return (
        <div> 
            {this.props.getUserAppSetting(this.props.user, 'tooltipShow') && (
            <Button
              className="mr-input mr-border-none mr-shadow-none mr-bg-green mr-p-4"
            >
              <SvgSymbol sym="close-icon" className="mr-w-4 mr-h-4 mr-fill-current" viewBox="0 0 20 20" onClick={this.handleClick}/>
              <FormattedMessage {...messages.tempFeature}/>
            </Button>
            )}
        </div>
    )
  }
}

export default NotificationCard
