import React from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import messages from "./Messages";

const TestEnvironmentBanner = (_props) => {
  // Check the current environment
  const environment = window.env.REACT_APP_ENVIRONMENT;

  // Only render the banner if not in production
  if (environment === "production") return null;

  return (
    <ul className="mr-bg-gradient-b-blue-darker-blue-dark mr-text-white mr-w-full">
      <li className="mr-flex mr-justify-center mr-items-center mr-w-full mr-py-2 mr-px-4">
        <div className="mr-text-yellow mr-text-md mr-text-center mr-break-words">
          {environment === "staging" ? (
            <FormattedMessage {...messages.stagingTitle} />
          ) : environment === "local" ? (
            <FormattedMessage {...messages.localTitle} />
          ) : null}
        </div>
      </li>
    </ul>
  );
};

export default injectIntl(TestEnvironmentBanner);
