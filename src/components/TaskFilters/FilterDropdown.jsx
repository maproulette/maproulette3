import { Component, Fragment } from "react";
import Dropdown from "../Dropdown/Dropdown";
import SvgSymbol from "../SvgSymbol/SvgSymbol";

export default class FilterDropdown extends Component {
  render() {
    return (
      <Dropdown
        className="mr-dropdown--right"
        dropdownButton={(dropdown) => (
          <button
            className="mr-flex mr-items-center mr-text-mango"
            onClick={dropdown.toggleDropdownVisible}
          >
            <span className="mr-text-base mr-uppercase mr-mr-1">{this.props.title}</span>
            <SvgSymbol
              sym="icon-cheveron-down"
              viewBox="0 0 20 20"
              className="mr-fill-current mr-w-5 mr-h-5"
            />
          </button>
        )}
        dropdownContent={(dropdown) => (
          <Fragment>
            <ul className="mr-list-dropdown">
              {typeof this.props.filters === "function"
                ? this.props.filters(dropdown)
                : this.props.filters}
            </ul>
            {this.props.secondaryFilterLabel && (
              <Fragment>
                <h5 className="mr-text-mango mr-my-4 mr-pt-2 mr-border-t mr-border-grey mr-uppercase mr-text-normal">
                  {this.props.secondaryFilterLabel}
                </h5>
                <ul className="mr-list-dropdown">
                  {typeof this.props.secondaryFilters === "function"
                    ? this.props.secondaryFilters(dropdown)
                    : this.props.secondaryFilters}
                </ul>
              </Fragment>
            )}
          </Fragment>
        )}
      />
    );
  }
}
