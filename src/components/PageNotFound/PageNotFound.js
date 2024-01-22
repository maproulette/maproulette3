import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import messages from './Messages'
import Illustration404 from '../../static/images/404-illustration.svg'
import MetaDecorator from '../../utils/metaDecorator'
import Image from '../../static/images/bg-map@2x.jpg'

/**
 * PageNotFound displays a 404 message.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class PageNotFound extends Component {
  render() {
    return (
      <div>
        <MetaDecorator
          description={"Test Data"}
          title={"Test Data"}
          imageUrl={Image}
          imageAlt={"image not found test data"}
        />  
        <div className="mr-min-h-content-no-filters mr-bg-gradient-b-blue-darker-blue-dark mr-flex mr-items-center mr-p-4">
          <div className="mr-flex-grow mr-max-w-lg mr-mx-auto mr-text-center mr-text-white">
            <img src={Illustration404} alt="404 - page not found" />
            <p className="mr-my-8 mr-text-lg">
              <FormattedMessage {...messages.missingPage} />
            </p>
            <Link className="mr-button" to="/">
              <FormattedMessage {...messages.homePage} />
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
