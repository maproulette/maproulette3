import React from "react";
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from "./Messages";

const TestEnvironmentBanner = (_props) => {
  // Check the current environment
  const environment = window.env.REACT_APP_ENVIRONMENT;

  // Only render the banner if not in production
  if (environment === 'production') return null;

  return (
    <ul className="mr-bg-gradient-b-blue-darker-blue-dark mr-text-white mr-w-full">
      <li className="mr-flex mr-justify-between mr-items-center mr-w-full mr-py-2 mr-px-16">
        <div className="mr-flex mr-space-x-4 mr-items-center">
          <div className="mr-text-yellow mr-text-md mr-whitespace-nowrap">
            {environment === 'staging' ? 
              <FormattedMessage {...messages.stagingTitle} />
            : environment === 'local' ?
              <FormattedMessage {...messages.localTitle} />
            : null}
            </div> 
        </div>
      </li>
    </ul>
  );
};

export default injectIntl(TestEnvironmentBanner);
