import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { replacePropertyTags } from "../../hooks/UsePropertyReplacement/UsePropertyReplacement";
import Dropdown from "../Dropdown/Dropdown";
import SvgSymbol from "../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * Displays list of custom URLs as links, performing replacement of mustache
 * tags with the given properties. If a URL references a property that is not
 * available, it is shown in a disabled state
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const CustomUrlList = (props) => {
  const [urlItems, setUrlItems] = useState([]);
  const { urls, properties, editCustomUrl, deleteCustomUrl } = props;

  useEffect(() => {
    setUrlItems(
      _map(urls, (url) => {
        let disabled = false;
        let replacedUrl = null;
        let replacedDescription = null;
        let replacedName = null;
        try {
          replacedUrl = replacePropertyTags(url.url, properties, true);
          replacedDescription = replacePropertyTags(url.description, properties, true);
          replacedName = replacePropertyTags(url.name, properties, true);
        } catch (err) {
          disabled = true;
        }

        return (
          <li key={url.id} className="mr-my-2 mr-flex mr-justify-between mr-items-center">
            {disabled ? (
              <span className="mr-text-grey-light" title={replacedDescription}>
                {replacedName}
              </span>
            ) : (
              <a
                href={encodeURI(replacedUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title={replacedDescription}
              >
                {replacedName}
              </a>
            )}
            <div className="mr-h-5">
              <Dropdown
                className="mr-dropdown--right"
                dropdownButton={(dropdown) => (
                  <button
                    onClick={dropdown.toggleDropdownVisible}
                    className="mr-flex mr-items-center mr-text-white-40"
                  >
                    <SvgSymbol
                      sym="navigation-more-icon"
                      viewBox="0 0 20 20"
                      className="mr-fill-current mr-w-5 mr-h-5"
                    />
                  </button>
                )}
                dropdownContent={() => (
                  <ul className="mr-list-dropdown mr-links-green-lighter">
                    <li>
                      <a onClick={() => editCustomUrl(url.id)}>
                        <FormattedMessage {...messages.editLabel} />
                      </a>
                    </li>
                    <li>
                      <a onClick={() => deleteCustomUrl(url.id)}>
                        <FormattedMessage {...messages.deleteLabel} />
                      </a>
                    </li>
                  </ul>
                )}
              />
            </div>
          </li>
        );
      }),
    );
  }, [urls, properties, editCustomUrl, deleteCustomUrl]);

  if (_isEmpty(urlItems)) {
    return (
      <div>
        <FormattedMessage {...messages.noCustomUrls} />
        <button
          type="button"
          className="mr-button mr-button--xsmall mr-ml-2"
          onClick={() => editCustomUrl()}
        >
          <FormattedMessage {...messages.addLabel} />
        </button>
      </div>
    );
  }
  return <ul className="mr-links-green-lighter mr-pb-24">{urlItems}</ul>;
};

export default CustomUrlList;
