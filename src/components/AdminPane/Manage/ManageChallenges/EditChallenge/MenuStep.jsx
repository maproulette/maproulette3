import _map from "lodash/map";
import { FormattedMessage } from "react-intl";
import SvgSymbol from "../../../../SvgSymbol/SvgSymbol";

const MenuStep = (props) => {
  return (
    <div>
      <label className="mr-text-mango mr-text-md mr-uppercase mr-mb-2">
        <FormattedMessage {...props.headerMessage} />
      </label>
      {props.introMessage && (
        <p className="mr-mt-4 mr-text-sm mr-text-grey-light-more">
          <FormattedMessage {...props.introMessage} />
        </p>
      )}

      <div className="mr-my-8">
        {_map(props.step.next, (stepName) => (
          <button
            key={stepName}
            type="button"
            className="mr-flex mr-items-center mr-my-2"
            onClick={() => props.transitionToStep(stepName)}
          >
            {props.challengeSteps[stepName].icon && (
              <SvgSymbol
                sym={props.challengeSteps[stepName].icon}
                viewBox="0 0 100 125"
                className="mr-fill-green-lighter mr-w-auto mr-h-6 mr-mr-4"
              />
            )}
            <div className="mr-mr-4">{props.challengeSteps[stepName].description || stepName}</div>
            <SvgSymbol
              sym="arrow-right-icon"
              viewBox="0 0 20 20"
              className="mr-fill-green-lighter mr-w-4 mr-h-4"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuStep;
