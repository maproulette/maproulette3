import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

class Intro extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24">
        <div className="mr-max-w-3xl mr-mx-auto md:mr-grid md:mr-grid-columns-12 md:mr-grid-gap-8 lg:mr-grid-gap-12">
          <div className="mr-mb-8 md:mr-mb-0 md:mr-col-span-5 mr-flex mr-items-center">
            <div className="mr-pb-12 mr-pt-6 mr-px-16 mr-bg-blue mr-text-white mr-rounded-sm mr-shadow mr-text-center">
              <div className="mr-text-yellow mr-uppercase mr-text-3xl lg:mr-text-3xl mr-text-center mr-pb-2">
              <FormattedMessage {...messages.introOver} />
              </div>
              <span className="mr-ticker mr-text-4xl lg:mr-text-5xl">
                <span>2</span>
                <span>5</span>
                <span>0</span>
                <span>0</span>
                <span>0</span>
                <span>0</span>
              </span>
              <h3 className="mr-mt-8 mr-leading-normal">
                <FormattedMessage {...messages.introSolved} />
                <br/>
                <FormattedMessage {...messages.introVia} />
              </h3>
            </div>
          </div>
          <div className="mr-text-center md:mr-text-left md:mr-col-span-7">
            <h2 className="mr-text-blue-light mr-my-6 mr-font-medium">
              <FormattedMessage {...messages.introHeader} />
            </h2>
            <p className="md:mr-text-md mr-mb-6">
              <FormattedMessage {...messages.introBody} />
            </p>
          </div>
        </div>
      </section>
    )
  }
}

export default Intro
