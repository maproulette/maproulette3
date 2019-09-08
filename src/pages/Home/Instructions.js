import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'

class Instructions extends Component {
  render() {
    return (
      <section className="mr-px-4 mr-py-12 md:mr-py-24 mr-bg-green-dark mr-text-white mr-bg-cover mr-bg-road">
        <div className="mr-max-w-3xl mr-mx-auto">
          <div className="mr-max-w-lg">
            <h2 className="md:mr-text-5xl mr-font-normal mr-text-white">
              <FormattedMessage {...messages.instructionsHeader} />
            </h2>
            <p className="md:mr-text-md mr-my-6">
            <FormattedMessage {...messages.instructionsParagraph1} />
            </p>

            <p className="md:mr-text-md mr-mb-8">
            <FormattedMessage {...messages.instructionsParagraph2} />
            </p>

            <Link to="/browse/challenges" className="mr-button">
            <FormattedMessage {...messages.instructionsButton} />
            </Link>
          </div>
        </div>
      </section>
    )
  }
}

export default Instructions
