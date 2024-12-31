import { useState } from "react";
import { FormattedMessage } from "react-intl";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * ScreenTooNarrow displays a message indicating that the user's screen/window
 * is too narrow to display the current page
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const ScreenTooNarrow = () => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <div className="mr-fixed mr-z-200 mr-bottom-0 mr-w-full mr-bg-black-75 mr-p-2">
        <h1 className="mr-text-yellow mr-text-base mr-text-center">
          <FormattedMessage {...messages.header} />
        </h1>
      </div>
    );
  }

  return (
    <div className="mr-fixed mr-z-200 mr-bottom-0 mr-h-screen50 mr-bg-black-75 mr-rounded-t-lg mr-shadow-lg mr-p-4 mr-mx-12">
      <div className="mr-flex mr-justify-end">
        <button type="button" onClick={() => setMinimized(true)}>
          <SvgSymbol
            viewBox="0 0 20 20"
            sym="icon-close"
            className="mr-fill-green-lighter mr-w-4 mr-h-4"
          />
        </button>
      </div>

      <div className="mr-flex mr-items-start">
        <SvgSymbol
          viewBox="0 0 20 20"
          sym="computer-icon"
          className="mr-fill-grey-light mr-w-1/4 mr-h-1/4 mr-mr-8"
        />
        <div>
          <h1 className="mr-text-yellow mr-text-2xl mr-mb-4">
            <FormattedMessage {...messages.header} />
          </h1>
          <p className="mr-text-white mr-text-base">
            <FormattedMessage {...messages.message} />
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScreenTooNarrow;
