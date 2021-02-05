import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { ReactComponent as WorldMapImage }
       from '../../static/images/bg-map.svg'
import messages from './Messages'

export default class Hero extends Component {
  render() {
    return (
      <div className="md:mr-h-hero mr-bg-black mr-text-white mr-bg-cover mr-bg-center mr-bg-hero mr-flex mr-justify-between mr-items-center mr-py-10 mr-px-4">
        <div className="mr-w-1/2 mr-flex mr-flex-col mr-items-center">
          <div className="mr-flex mr-flex-col mr-pl-4">
            <h1 className="mr-text-3xl mr-font-light md:mr-text-5xl lg:mr-text-6xl mr-flex mr-flex-col mr-justify-start">
              <FormattedMessage {...messages.heroFirstLine} />
              <FormattedMessage {...messages.heroSecondLine} />
              <FormattedMessage {...messages.heroThirdLine} />
            </h1>
            <Link to="/browse/challenges" className="mr-button mr-mt-8 mr-w-2/3">
              <FormattedMessage {...messages.getStartedLabel} />
            </Link>
          </div>
        </div>
        <div className="mr-w-1/2 mr-h-64">
          <WorldMapImage viewBox="0 0 687 350" className="mr-w-auto mr-h-64" />
        </div>
      </div>
    )
  }
}
