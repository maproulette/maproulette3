import _map from "lodash/map";
import { Component, Fragment } from "react";
import { FormattedMessage } from "react-intl";
import BusySpinner from "../../BusySpinner/BusySpinner";
import Dropdown from "../../Dropdown/Dropdown";
import WithNominatimSearch from "../../HOCs/WithNominatimSearch/WithNominatimSearch";
import SvgSymbol from "../../SvgSymbol/SvgSymbol";
import messages from "./Messages";

/**
 * Location SearchBox presents a map search box that can be used to execute
 * geographic searches via Nominatim (name searches, lon/lat searches, etc.)
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class LocationSearchBox extends Component {
  state = {
    showDropdown: false,
  };

  /**
   * Esc clears search, Enter signals completion
   *
   * @private
   */
  checkForSpecialKeys = (e) => {
    // Ignore if modifier keys were pressed
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    } else if (e.key === "Escape") {
      this.props.clearNominatimSearch();
    } else if (e.key === "Enter") {
      this.props.searchNominatim();
      this.setState({ showDropdown: true });
    }
  };

  render() {
    const resultItems = _map(this.props.nominatimResults, (result) => (
      <li key={result.osmId || result.placeId}>
        <button
          className="mr-text-current hover:mr-text-yellow"
          onClick={() => this.props.chooseNominatimResult(result)}
        >
          {result.name}
        </button>
      </li>
    ));

    return (
      <div className="mr-dropdown--right mr-inline-block">
        <div className="">
          <div className="mr-flex mr-justify-between mr-items-center">
            <div className="mr-flex mr-items-center mr-text-sm">
              <input
                className="mr-input mr-py-1 mr-leading-normal mr-border-none"
                type="text"
                placeholder="Location"
                value={this.props.nominatimQuery}
                onChange={(e) => this.props.updateNominatimQuery(e.target.value)}
                onKeyDown={this.checkForSpecialKeys}
              />
              {this.props.nominatumSearching ? (
                <BusySpinner inline className="mr-static" />
              ) : (
                <button
                  className="mr-button mr-button--small mr-button--blue-fill mr-ml-2"
                  onClick={() => {
                    this.props.searchNominatim();
                    this.setState({ showDropdown: true });
                  }}
                >
                  <FormattedMessage {...messages.searchLabel} />
                </button>
              )}
            </div>
          </div>

          {this.props.nominatimResults && this.state.showDropdown && (
            <Dropdown
              className="mr-flex"
              arrowClassName="mr-pr-5"
              toggleVisible={() => null}
              isVisible
              dropdownButton={() => null}
              dropdownContent={() => (
                <Fragment>
                  <div className="mr-text-right">
                    <button
                      className="mr-top-0 mr-right-0 mr-transition mr-text-green-lighter hover:mr-text-white"
                      onClick={() => {
                        this.props.clearNominatimSearch();
                        this.setState({ showDropdown: false });
                      }}
                    >
                      <SvgSymbol
                        sym="close-outline-icon"
                        viewBox="0 0 20 20"
                        className="mr-fill-current mr-w-5 mr-h-5"
                      />
                    </button>
                  </div>
                  {resultItems.length === 0 ? (
                    <FormattedMessage {...messages.noResults} />
                  ) : (
                    <ol
                      className="mr-o-2 mr-max-w-screen50 mr-overflow-x-scroll"
                      onClick={() => this.setState({ showDropdown: false })}
                    >
                      {resultItems}
                    </ol>
                  )}
                </Fragment>
              )}
            />
          )}
        </div>
      </div>
    );
  }
}

export default WithNominatimSearch(LocationSearchBox);
