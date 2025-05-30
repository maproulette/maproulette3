import classNames from "classnames";
import { FormattedMessage } from "react-intl";
import useErrorTagOptions from "../../hooks/UseErrorTagOptions";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

const SelectOptions = (props) => {
  const defaultOption = [<option key="-1" value="-1" />];

  if (props.options?.length) {
    const filteredOptions = props.options.filter((option) => {
      if (props.rt === option.id) {
        return true;
      }

      if (props.errorTags.includes(option.id)) {
        return false;
      }

      return true;
    });

    const actualOptions = filteredOptions.map((option) => {
      return (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      );
    });

    return defaultOption.concat(actualOptions);
  } else {
    return defaultOption;
  }
};

const ErrorTagDropdown = (props) => {
  const options = useErrorTagOptions();

  if (options.data) {
    options.data = options.data.filter((option) => option.active !== false);
  }

  return (
    <div className="mr-mt-4">
      {props.errorTags?.length
        ? props.errorTags.map((rt, index) => {
            return (
              <div className="mr-mt-4 mr-mb-2" key={index}>
                <div className="mr-mb-1">
                  <FormattedMessage {...messages.errorTag} />
                </div>
                <div className="mr-flex">
                  <select
                    key="name-error-tags"
                    className="form-select form-control"
                    onChange={(e) => props.onChange(e, index)}
                    value={rt}
                  >
                    <SelectOptions options={options.data} errorTags={props.errorTags} rt={rt} />
                  </select>
                  <button
                    className="is-clear array-field__item__control remove-item-button button mr-ml-2"
                    onClick={() => props.removeErrorTag(index)}
                  >
                    <span className="icon is-danger">
                      <SvgSymbol sym="trash-icon" viewBox="0 0 20 20" className="mr-w-5 mr-h-5" />
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        : null}
      {props.errorTags?.length < 5 && props.errorTags?.length < options.data?.length ? (
        <div className="mr-flex mr-items-center">
          <div
            className={classNames("mr-underline mr-cursor-pointer", {
              "mr-text-red": props.required && (!props.errorTags || props.errorTags.length === 0),
              "mr-text-green-light":
                !props.required || (props.errorTags && props.errorTags.length > 0),
            })}
            onClick={props.addErrorTag}
          >
            <FormattedMessage {...messages.addErrorTag} />
          </div>

          {props.required && (!props.errorTags || props.errorTags.length === 0) && (
            <span className="mr-no-underline mr-text-red mr-ml-1">
              - (<FormattedMessage {...messages.requiredByChallengeOwner} />)
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ErrorTagDropdown;
