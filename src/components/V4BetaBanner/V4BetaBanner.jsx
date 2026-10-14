import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import messages from "./Messages";

const V4_BANNER_DISMISSED_KEY = "v4BetaBannerDismissed";

const V4BetaBanner = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(V4_BANNER_DISMISSED_KEY) === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(V4_BANNER_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  // Check the current environment
  const environment = window.env.REACT_APP_ENVIRONMENT;
  const urlParams = new URLSearchParams(window.location.search);
  const forceShow = urlParams.has("showV4Banner");

  // Only render the banner on production, unless force-show via URL parameter
  // When forceShow is true, ignore both environment check and dismissal state
  if (!forceShow && (environment !== "production" || isDismissed)) return null;

  return (
    <div className="mr-bg-gradient-l-green-blue mr-text-white mr-w-full mr-py-3 mr-px-4 mr-flex mr-items-center mr-justify-between">
      <div className="mr-text-center mr-text-md mr-flex-1 mr-px-8">
        <span className="mr-font-bold">
          <FormattedMessage {...messages.v4BetaAnnouncement} />
        </span>
        {" "}
        <a
          href="https://beta.maproulette.org"
          target="_blank"
          rel="noopener noreferrer"
          className="mr-underline mr-font-bold mr-text-yellow hover:mr-text-yellow-75"
        >
          beta.maproulette.org
        </a>
      </div>
      <button
        onClick={handleDismiss}
        className="mr-text-white hover:mr-text-yellow mr-text-3xl mr-font-bold mr-leading-none mr-flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

export default V4BetaBanner;
