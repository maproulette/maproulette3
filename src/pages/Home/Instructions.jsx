import { Component } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import messages from "./Messages";

class Instructions extends Component {
  render() {
    return (
      <section className="mr-bg-gradient-b-blue-darker-blue-dark mr-relative">
        <div className="mr-flex mr-px-4 mr-py-12 md:mr-py-24 mr-text-white mr-relative mr-z-5">
          <div className="mr-w-1/2 mr-flex mr-justify-center mr-mt-8">
            <h2 className="md:mr-text-6xl mr-text-yellow mr-font-light">
              <FormattedMessage {...messages.instructionsHeader} />
            </h2>
          </div>
          <div className="mr-w-1/2 mr-pr-8">
            <p className="md:mr-text-md mr-my-6">
              <FormattedMessage {...messages.instructionsFirstParagraph} />
            </p>

            <p className="md:mr-text-md mr-mb-8">
              <FormattedMessage {...messages.instructionsSecondParagraph} />
            </p>

            <Link to="/browse/challenges" className="mr-button mr-mt-8 mr-w-2/3">
              <FormattedMessage {...messages.instructionsFindChallengesLabel} />
            </Link>
          </div>
        </div>
        <div className="mr-bg-skyline mr-bg-repeat-x mr-w-full mr-h-half mr-absolute mr-bottom-0 mr-z-0"></div>
      </section>
    );
  }
}

export default Instructions;
