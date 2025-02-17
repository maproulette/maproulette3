import { memo } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import worldMapImage from "../../../images/bg-map.svg";
import messages from "./Messages";

const Hero = function Hero() {
  return (
    <div className="mr-relative mr-bg-cover mr-bg-hero mr-bg-gradient-to-br mr-from-gray-900 mr-to-black mr-overflow-hidden mr-h-[80vh]">
      {/* Background image */}
      <div className="mr-absolute mr-inset-0 mr-pointer-events-none">
        <div className="mr-relative mr-h-full">
          <div className="mr-absolute mr-inset-0 mr-bg-gradient-to-t mr-from-black/90 mr-via-gray-900/50 mr-to-transparent mr-z-10" />
          <img
            src={worldMapImage}
            alt="World Map Visualization"
            className="mr-w-full mr-h-full mr-object-contain mr-object-center mr-scale-90 mr-opacity-50"
            style={{
              opacity: 0.7,
            }}
          />
        </div>
      </div>

      <div className="mr-container mr-mx-auto mr-px-4 sm:mr-px-6 mr-h-full">
        <div className="mr-flex mr-flex-col mr-justify-center mr-h-full mr-items-center mr-gap-8">
          <div className="mr-w-full mr-max-w-[800px] mr-z-10 mr-text-center">
            <h1 className="mr-text-3xl sm:mr-text-4xl md:mr-text-5xl lg:mr-text-6xl mr-font-bold mr-text-white mr-leading-tight mr-mb-8 mr-tracking-tight">
              <FormattedMessage {...messages.headline} />
            </h1>
            <Link to="/browse/challenges" className="mr-button mr-w-full mr-max-w-[300px] mr-py-4">
              <FormattedMessage {...messages.getStartedLabel} />
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative overlay */}
      <div className="mr-absolute mr-inset-0 mr-bg-grid-pattern mr-opacity-10" />

      {/* Additional gradient for better text contrast */}
      <div className="mr-absolute mr-inset-0 mr-bg-gradient-to-t mr-from-black/50 mr-via-transparent mr-to-black/30" />
    </div>
  );
};

export default Hero;
